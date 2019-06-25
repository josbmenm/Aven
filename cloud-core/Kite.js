// Kite - The lightweight Aven Cloud Client

import xs from 'xstream';
import getIdOfValue from '../cloud-utils/getIdOfValue';

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
  load: () => Promise<void>


Block
  value: CloudValue()

BlockState


Doc



*/

function map(cloudValue, mapFn) {
  function get() {
    return mapFn(cloudValue.get());
  }
  return {
    ...cloudValue,
    get,
    stream: cloudValue.stream.map(mapFn),
  };
}

function createCloudValue(
  initialValue,
  addListener,
  removeListener,
  getAttachmentStatus,
) {
  let currentValue = initialValue;
  let isAttached = false;
  let onIsAttached = null;
  function setAttachment(err, isConnectedUpstream) {
    const isAtt = getAttachmentStatus(currentValue, err, isConnectedUpstream);
    if (isAtt === isAttached) {
      return;
    }
    isAttached = isAtt;
    onIsAttached && onIsAttached(isAttached);
  }

  let internalListener = null;
  function start(listener) {
    listener.next(currentValue);
    if (internalListener) {
      throw new Error(
        'Listener has not been stopped! This is likely a misunderstanding with xstream..',
      );
    }
    internalListener = {
      next: value => {
        currentValue = value;
        listener.next(value);
        setAttachment(null, true);
      },
      error: e => {
        listener.error(e);
        setAttachment(e, false);
      },
      complete: () => {
        listener.complete();
        setAttachment(null, false); // maybe not need this?
      },
    };
    addListener(internalListener);
  }
  function stop() {
    setAttachment(null, false);
    if (internalListener) {
      removeListener(internalListener);
      internalListener = null;
    }
  }
  async function load() {
    if (isAttached) {
      return currentValue;
    }
    return new Promise((resolve, reject) => {
      let loadTimeout = setTimeout(() => {
        reject(new Error('Timed out loading..'));
      }, 30000);

      let loadListener = null;

      function wrapUp() {
        clearTimeout(loadTimeout);
        if (loadListener) {
          removeListener(loadListener);
          loadListener = null;
        }
      }
      loadListener = {
        next: value => {
          currentValue = value;
          setAttachment(null, false);
          wrapUp();
          resolve(value);
        },
        error: e => {
          setAttachment(e, false);
          wrapUp();
          reject(e);
        },
        complete: () => {
          setAttachment(null, false); // maybe not need this?
          // should be covereed by next and erorr?
        },
      };
      addListener(loadListener);
    });
  }
  return {
    stream: xs.createWithMemory({ start, stop }),
    isAttachedStream: xs.createWithMemory({
      start: l => {
        l.next(isAttached);
        onIsAttached = isAtt => l.next(isAtt);
      },
      stop: () => {
        onIsAttached = null;
      },
    }),
    get: () => currentValue,
    getIsAttached: () => isAttached,
    load,
  };
}

// const blockValueCache = new WeakMap();

export function createBlock({ domain, onGetName, source, id, value }) {
  let observedBlockId = null;

  if (value !== undefined) {
    observedBlockId = getIdOfValue(value);
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

  const initValue = value;
  // const initValue = value === undefined ? blockValueCache.get(blockId) : value;

  const initialBlockState = {
    id: blockId, // Known to be the correct id by this point
    value: initValue, // either the block's final value, or undefined
    lastFetchTime: null,
    lastPutTime: null,
  };

  function internalAddListener(listener) {
    source
      .dispatch({
        type: 'GetBlock',
        domain,
        name: onGetName(),
        id: blockId,
      })
      .then(resp => {
        listener.next({
          ...resp,
          lastFetchTime: Date.now(),
        });
      })
      .catch(err => {
        listener.error(err);
      });
  }

  function internalRemoveListener(listener) {
    // no way to cancel the loading of a block..
  }

  function getValueAttachmentStatus(
    valueState,
    loadError,
    isConnectedUpstream,
  ) {
    if (loadError) {
      console.warn('Error loading block..', loadError);
    }
    if (valueState && valueState.value !== undefined) {
      return true;
    }
    return false;
  }

  const blockStateValue = createCloudValue(
    initialBlockState,
    internalAddListener,
    internalRemoveListener,
    getValueAttachmentStatus,
  );
  const blockValue = map(
    blockStateValue,
    blockState => blockState && blockState.value,
  );

  function getReference() {
    if (!blockId) {
      throw new Error(
        'Cannot getReference of an incomplete block without a value or id',
      );
    }
    return { type: 'BlockReference', id: blockId };
  }

  const cloudBlock = {
    ...blockStateValue,
    getReference,
    value: blockValue,
  };

  // if (!blockValueCache.has(cloudBlock)) {
  //   blockValueCache.set(observedBlockId, value);
  // }

  return cloudBlock;
}

export function createDoc({ source, domain, name }) {
  function getReference() {
    return {
      type: 'DocReference',
      domain,
      name: getFullName(),
      id: getId(),
    };
  }

  const docStateValue = createCloudValue();
  // initialBlockState,
  // internalAddListener,
  // internalRemoveListener,
  // getValueAttachmentStatus,

  return {
    ...docStateValue,
    getReference,
  };
}
