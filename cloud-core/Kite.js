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

async function streamLoad(stream) {
  return new Promise((resolve, reject) => {
    let loadTimeout = setTimeout(() => {
      reject(new Error('Timed out loading..'));
    }, 30000);

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

function createCloudValue2(memoryStream) {
  return {
    get: () => streamGet(memoryStream),
    load: () => streamLoad(memoryStream),
    stream: memoryStream,
  };
}

// A utility to extract the current value from a stream with memory, aka a stream that updates with a value right away upon subscription
function streamGet(stream) {
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

export function createBlock({ domain, nameStream, source, id, value }) {
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

  let lastBlockState = initialBlockState;

  let onStop = null;
  const blockStateStream = xs.createWithMemory({
    start: notify => {
      notify.next(lastBlockState);
      source
        .dispatch({
          type: 'GetBlock',
          domain,
          name: streamGet(nameStream),
          id: blockId,
        })
        .then(resp => {
          lastBlockState = {
            ...lastBlockState,
            value: resp.value,
            lastFetchTime: Date.now(),
          };
          notify.next(lastBlockState);
        })
        .catch(err => {
          notify.error(err);
        });
    },
    stop: () => {
      if (onStop) {
        onStop();
        onStop = null;
      }
    },
  });
  const blockStateValue = createCloudValue2(blockStateStream);

  const blockValue = createCloudValue2(
    blockStateStream
      .map(blockState => {
        return blockState.value;
      })
      .filter(val => val !== undefined)
      .remember()
      .debug(v => {}), // uhh, remember doesnt seem to work until this debug is here....???
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

  return cloudBlock;
}

export function createDoc({ source, domain, nameStream }) {
  const getName = () => streamGet(nameStream);

  let lastDocState = {
    lastFetchTime: null,
    id: null,
  };

  function getReference() {
    return {
      type: 'DocReference',
      domain,
      name: getName(),
      id: lastDocState.id,
    };
  }

  const docBlocks = {};

  function getBlock(id) {
    if (docBlocks[id]) {
      return docBlocks[id];
    }
    docBlocks[id] = createBlock({ domain, nameStream, source, id });

    return docBlocks[id];
  }

  let doStop = null;
  const docProducer = {
    start: listen => {
      listen.next(lastDocState);
      const upStream = source.getDocStream(domain, getName());
      const internalListener = {
        next: v => {
          lastDocState = {
            ...lastDocState,
            lastFetchTime: Date.now(),
            id: v.id,
          };
          if (v.value) {
            throw new Error(
              'Streaming value! not yet impll.. go make a block, ok',
            );
          }
          listen.next(lastDocState);
        },
        error: e => {
          listen.error(e);
        },
        complete: () => {
          listen.complete();
        },
      };
      upStream.addListener(internalListener);
      doStop = () => upStream.removeListener(internalListener);
    },
    stop: () => {
      doStop && doStop();
    },
  };

  const docStream = xs.createWithMemory(docProducer);

  const docStateValue = createCloudValue2(docStream);

  // flat map cloud value..

  const value = createCloudValue2(
    docStream
      .filter(state => !!state.id)
      .map(state => {
        const block = getBlock(state.id);
        return block.value.stream;
      })
      .flatten()
      .filter(state => state !== undefined)
      .remember()
      .debug(v => {}), // uhh, remember doesnt seem to work until this debug is here....???
  );

  return {
    ...docStateValue,
    getReference,
    value,
    getBlock,
  };
}
