// A utility to extract the current value from a stream with memory, aka a stream that updates with a value right away upon subscription
export function streamGet(stream) {
  let val = undefined;
  const listener = {
    next: v => {
      val = v;
    },
  };
  stream.addListener(listener);
  // ok.. we expect that the stream has updated the listener with the current value!
  stream.removeListener(listener);
  return val;
}

export async function streamLoad(stream, onGetContext) {
  return new Promise((resolve, reject) => {
    let loadTimeout = setTimeout(() => {
      reject(new Error(`Timed out loading "${onGetContext()}".`));
    }, 3000);

    let loadListener = null;

    function wrapUp() {
      clearTimeout(loadTimeout);
      if (loadListener) {
        stream.removeListener(loadListener);
        loadListener = null;
      }
    }
    loadListener = {
      next: value => {
        resolve(value);
        wrapUp();
      },
      error: e => {
        reject(e);
        wrapUp();
      },
      complete: () => {
        // should be covereed by next and erorr?
      },
    };
    stream.addListener(loadListener);
  });
}

export function createStreamValue(stream, onGetContext) {
  // const stream = inputStream.remember().debug(v => {
  //   // console.log(`See the stream value ${onGetContext()}..`, !!v);
  // });
  return {
    type: 'StreamValue-DEPRECATE-ME',
    get: () => streamGet(stream),
    load: () => streamLoad(stream, onGetContext),
    stream,
  };
}
