export function streamOf(initialValue, crumb) {
  const subscribers = new Set();
  let lastValue = initialValue;

  function addListener(sub) {
    sub.next(lastValue);
    subscribers.add(sub);
  }

  function removeListener(sub) {
    subscribers.delete(sub);
  }

  function updateStream(value) {
    lastValue = value;
    subscribers.forEach(subs => subs.next(value));
  }

  const stream = {
    type: 'ValueStream',
    crumb,
    addListener,
    removeListener,
    get: () => lastValue,
    compose: composeFn => composeFn(stream),
    map: (mapper, mapDescriptor) => mapStream(stream, mapper, mapDescriptor),
    filter: (filterFn, filterDescriptor) =>
      filterStream(stream, filterFn, filterDescriptor),
    dropRepeats: (repeatComparator, dropRepeatsDescriptor) =>
      dropRepeatsStream(stream, repeatComparator, dropRepeatsDescriptor),
    flatten: () => flattenStream(stream),
    spy: spier => spyStream(stream, spier),
  };
  return [stream, updateStream];
}

export function streamOfValue(staticValue) {
  const [stream] = streamOf(staticValue);
  return stream;
}

export function combineStreams(inputs) {
  const inputEntries = Object.entries(inputs);
  const stoppers = new Set();
  const waitingForInputNames = new Set(Object.keys(inputs));
  const lastValues = {};
  const crumb = Object.fromEntries(
    inputEntries.map(([key, inputStream]) => {
      return [key, inputStream.crumb];
    }),
  );
  return createProducerStream({
    crumb,
    start: notifier => {
      inputEntries.forEach(([inputName, inputStream]) => {
        const listener = {
          next: v => {
            waitingForInputNames.delete(inputName);
            lastValues[inputName] = v;
            if (waitingForInputNames.size === 0) {
              notifier.next(lastValues);
            }
          },
          complete: () => {},
          error: e => {
            console.error('Error within combined stream', inputStream.crumb);
            notifier.error(e);
          },
        };
        inputStream.addListener(listener);
        stoppers.add(() => {
          inputStream.removeListener(listener);
        });
      });
    },
    stop: () => {
      stoppers.forEach(stop => stop());
      stoppers.clear();
    },
  });
}

function filterStream(stream, filterFn, filterDescriptor) {
  let listener = null;
  return createProducerStream({
    crumb: {
      type: 'FilteredStream',
      desc: filterDescriptor,
      on: stream.crumb,
    },
    start: notifier => {
      if (!listener) {
        listener = {
          next: val => {
            if (filterFn(val)) {
              notifier.next(val);
            }
          },
          complete: () => notifier.complete(),
          error: err => notifier.error(err),
        };
        stream.addListener(listener);
      }
    },
    stop: () => {
      if (listener) {
        stream.removeListener(listener);
        listener = null;
      }
    },
  });
}

const defaultComparator = (a, b) => a === b;

function dropRepeatsStream(
  stream,
  isRepeatingValue = defaultComparator,
  dropRepeatsDescriptor,
) {
  let lastEmitted = undefined;
  let hasEmitted = undefined;
  let listener = null;
  return createProducerStream({
    crumb: {
      type: 'DropRepeatedStream',
      on: stream.crumb,
      desc: dropRepeatsDescriptor,
    },
    start: notifier => {
      if (!listener) {
        listener = {
          next: val => {
            if (!hasEmitted || !isRepeatingValue(lastEmitted, val)) {
              notifier.next(val);
              lastEmitted = val;
              hasEmitted = true;
            }
          },
          complete: () => notifier.complete(),
          error: err => notifier.error(err),
        };
        stream.addListener(listener);
      }
    },
    stop: () => {
      if (listener) {
        lastEmitted = undefined;
        hasEmitted = false;
        stream.removeListener(listener);
        listener = null;
      }
    },
  });
}

function flattenStream(stream) {
  let listener = null;
  let cleanupLastListener = null;
  return createProducerStream({
    crumb: {
      type: 'FlattenedStream',
      on: stream.crumb,
    },
    start: notifier => {
      if (!listener) {
        listener = {
          next: downStream => {
            cleanupLastListener && cleanupLastListener();
            const downStreamListener = {
              next: val => {
                notifier.next(val);
              },
              error: err => {
                notifier.error(err);
              },
              complete: () => {},
            };
            downStream.addListener(downStreamListener);
            cleanupLastListener = () => {
              downStream.removeListener(downStreamListener);
            };
          },
          complete: () => {
            cleanupLastListener && cleanupLastListener();
            notifier.complete();
          },
          error: err => {
            cleanupLastListener && cleanupLastListener();
            notifier.error(err);
          },
        };
        stream.addListener(listener);
      }
    },
    stop: () => {
      if (listener) {
        stream.removeListener(listener);
        cleanupLastListener && cleanupLastListener();
        listener = null;
      }
    },
  });
}

function spyStream(stream, spier) {
  const reportHandler =
    typeof spier === 'function'
      ? spier
      : report => {
          typeof spier === 'string' && console.log(spier, stream.crumb, report);
        };
  let listener = null;
  return createProducerStream({
    crumb: { type: 'SpiedStream', on: stream.crumb },
    start: notifier => {
      if (!listener) {
        listener = {
          next: val => {
            reportHandler({ next: val });
            notifier.next(val);
          },
          complete: () => {
            reportHandler({ complete: true });
            notifier.complete();
          },
          error: err => {
            reportHandler({ error: err });
            notifier.error(err);
          },
        };
        stream.addListener(listener);
      }
    },
    stop: () => {
      if (listener) {
        stream.removeListener(listener);
        listener = null;
      }
    },
  });
}

function mapStream(stream, mapper, mapDescriptor) {
  let listener = null;
  return createProducerStream({
    crumb: { type: 'MappedStream', on: stream.crumb, mapDescriptor },
    start: notifier => {
      if (!listener) {
        listener = {
          next: val => notifier.next(mapper(val)),
          complete: () => notifier.complete(),
          error: err => notifier.error(err),
        };
        stream.addListener(listener);
      }
    },
    stop: () => {
      if (listener) {
        stream.removeListener(listener);
        listener = null;
      }
    },
  });
}

export function createProducerStream(producer) {
  const subscribers = new Set();
  let isListening = false;
  let hasEmitted = false;
  let lastValue = undefined;
  const crumb = producer.crumb;

  function addListener(sub) {
    if (hasEmitted) sub.next(lastValue);
    subscribers.add(sub);
    if (!isListening && !hasEmitted) {
      isListening = true;
      producer.start({
        next: value => {
          hasEmitted = true;
          lastValue = value;
          subscribers.forEach(subscriber => {
            subscriber.next && subscriber.next(value);
          });
        },
        complete: () => {
          isListening = false;
        },
        error: err => {
          subscribers.forEach(subscriber => {
            subscriber.error && subscriber.error(err);
          });
          subscribers.clear();
          isListening = false;
          hasEmitted = false;
          lastValue = undefined;
        },
      });
    }
  }

  let removeListenerTimeout = null;
  function removeListener(sub) {
    subscribers.delete(sub);
    clearTimeout(removeListenerTimeout);
    removeListenerTimeout = setTimeout(() => {
      if (subscribers.size === 0 && isListening) {
        hasEmitted = false;
        lastValue = undefined;
        if (isListening) {
          isListening = false;
          producer.stop();
        }
      }
    }, 1);
  }

  const stream = {
    type: 'MemoryStream',
    crumb,
    addListener,
    removeListener,
    get: () => lastValue,
    compose: composeFn => composeFn(stream),
    map: (mapper, mapDescriptor) => mapStream(stream, mapper, mapDescriptor),
    filter: (filterFn, filterDescriptor) =>
      filterStream(stream, filterFn, filterDescriptor),
    dropRepeats: (repeatComparator, dropRepeatsDescriptor) =>
      dropRepeatsStream(stream, repeatComparator, dropRepeatsDescriptor),
    flatten: () => flattenStream(stream),
    spy: spier => spyStream(stream, spier),
  };
  return stream;
}
