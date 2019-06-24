// Kite - The lightweight Aven Cloud Client

import xs from 'xstream';

/*

Pretend types:

CloudSubscriber<V, E>:
  next: (V) => void,
  error: (E) => void,
  complete: () => void,

AttachmentSubscriber:
  next: (isAttached: boolean) => void

CloudValue<V, E>:
  get: () => V,
  stream: {
    addListener: (s: CloudSubscriber<V, E>) => void,
    removeListener: (s: CloudSubscriber<V, E>) => void,
  }
  getIsAttached: () => bool,
  isAttachedStream: {
    addListener: (s: AttachmentSubscriber) => void,
    removeListener: (s: AttachmentSubscriber) => void,
  }


*/

function map(cloudValue) {
  return {};
}

function createCloudValue(initialValue, onStart, onStop) {
  let currentValue = initialValue;
  let isAttached = false;
  let onIsAttached = null;
  function setIsAttached(isConn) {
    if (isConn === isAttached) {
      return;
    }
    isAttached = isConn;
    onIsAttached && onIsAttached(isAttached);
  }
  function start(listener) {
    onStart({
      next: value => {
        currentValue = value;
        listener.next(value);
        setIsAttached(true);
      },
      error: e => {
        listener.error(e);
        setIsAttached(false);
      },
      complete: () => {
        listener.complete();
        setIsAttached(false);
      },
    });
  }
  function stop() {
    onStop();
  }

  return {
    stream: xs.createWithMemory({ start, stop }),
    isAttachedStream: xs.createWithMemory({
      start: l => {
        onIsAttached = l.next;
      },
      stop: () => {
        onIsAttached = null;
      },
    }),
    get: () => currentValue,
    getIsAttached: () => isAttached,
  };
}

export function createBlock({ domain, onGetName, dispatch, id, value }) {
  let observedBlockId = null;

  if (value !== undefined) {
    const valueString = JSONStringify(value);
    observedBlockId = SHA256(valueString).toString();
    blockValueCache[observedBlockId] = value;
  }
  const blockId = id || observedBlockId;
  if (!blockId && value === undefined) {
    throw new Error('Cannot create block without id or value!');
  }
  if (!blockId) {
    throw new Error('Block id could not be determined!');
  }
  if (id && observedBlockId && id !== observedBlockId) {
    throw new Error(
      'id and value were both provided to createCloudBlock, but the id does not match the value!',
    );
  }

  if (!blockId) {
    throw new Error('id or value must be provided to createCloudBlock!');
  }

  const initialBlockState = {
    id: blockId, // Known to be the correct id by this point
    value, // either the final value, or undefined
    lastFetchTime: null,
    lastPutTime: null,
  };

  const blockStateValue = createCloudValue(initialBlockState);
  const blockValue = map(
    blockStateValue,
    blockState => blockState && blockState.value,
  );

  return {
    ...blockStateValue,
    value: blockValue,
  };
}
