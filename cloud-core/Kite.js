// Kite - The lightweight Aven Cloud Client

import xs from 'xstream';
import getIdOfValue from '../cloud-utils/getIdOfValue';
import Err from '../utils/Err';

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

function createStreamValue(memoryStream) {
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

  let blockState = initialBlockState;

  let notifyStateChange = null;

  function setState(stateUpdates) {
    blockState = {
      ...blockState,
      ...stateUpdates,
    };
    notifyStateChange && notifyStateChange();
  }

  let onStop = null;
  const blockStateStream = xs.createWithMemory({
    start: notify => {
      notify.next(blockState);
      notifyStateChange = () => {
        notify.next(blockState);
      };
      const subsName = streamGet(nameStream);
      if (blockState.value === undefined) {
        source
          .dispatch({
            type: 'GetBlock',
            domain,
            name: subsName,
            id: blockId,
          })
          .then(resp => {
            blockState = {
              ...blockState,
              value: resp.value,
              lastFetchTime: Date.now(),
            };
            notify.next(blockState);
          })
          .catch(err => {
            notify.error(err);
          });
      }
    },
    stop: () => {
      if (onStop) {
        onStop();
      }
      notifyStateChange = null;
      onStop = null;
    },
  });
  const blockStateValue = createStreamValue(blockStateStream);

  const blockValue = createStreamValue(
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

  function shamefullySetPutTime() {
    // internal use only please
    setState({
      lastPutTime: Date.now(),
    });
  }

  async function put() {
    if (blockState.lastFetchTime || blockState.lastPutTime) {
      return;
    }
    if (blockState.value === undefined) {
      throw new Err('Cannot put empty block');
    }
    const name = streamGet(nameStream);
    const resp = await source.dispatch({
      type: 'PutBlock',
      domain,
      name,
      value: blockState.value,
    });
    if (resp.id !== blockId) {
      throw new Error(
        `Attempted to put "${name}" block "${blockId}" but the server claims the ID is "${
          resp.id
        }"`,
      );
    }
    shamefullySetPutTime();
  }

  const cloudBlock = {
    ...blockStateValue,
    id: blockId,
    getReference,
    value: blockValue,
    put,
    shamefullySetPutTime,
  };

  return cloudBlock;
}

export function createDoc({ source, domain, nameStream }) {
  const getName = () => streamGet(nameStream);

  let docState = {
    lastFetchTime: null,
    id: null,
  };

  function getReference() {
    return {
      type: 'DocReference',
      domain,
      name: getName(),
      id: docState.id,
    };
  }

  let doStop = null;
  let notifyStateChange = null;

  function setState(updates) {
    docState = {
      ...docState,
      ...updates,
    };
    notifyStateChange && notifyStateChange();
  }
  const docProducer = {
    start: listen => {
      listen.next(docState);
      notifyStateChange = () => {
        listen.next(docState);
      };
      const upStream = source.getDocStream(domain, getName());
      const internalListener = {
        next: v => {
          setState({
            lastFetchTime: Date.now(),
            id: v.id,
          });
          if (v.value) {
            throw new Error(
              'Streaming value! not yet impll.. go make a block, ok',
            );
          }
          listen.next(docState);
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
      doStop = null;
      notifyStateChange = null;
    },
  };

  const docStream = xs.createWithMemory(docProducer);

  const docStateValue = createStreamValue(docStream);

  const docBlocks = {};

  function getBlockOfValue(value) {
    const block = createBlock({
      source,
      domain,
      nameStream,
      value,
    });
    if (docBlocks[block.id]) {
      return docBlocks[block.id];
    }
    return (docBlocks[block.id] = block);
  }

  function getBlock(id) {
    if (docBlocks[id]) {
      return docBlocks[id];
    }
    docBlocks[id] = createBlock({ domain, nameStream, source, id });

    return docBlocks[id];
  }

  async function publishValue(value) {
    const block = getBlockOfValue(value);
    await block.put();
    return block;
  }

  async function putValue(value) {
    const block = getBlockOfValue(value);
    await putBlock(block);
  }

  function isBlockPublished(block) {
    const blockState = block.get();
    return blockState.lastFetchTime != null || blockState.lastPutTime != null;
  }

  async function putBlock(block) {
    const lastId = docState.id;
    if (isBlockPublished(block)) {
      setState({
        puttingFromId: lastId,
        id: block.id,
      });
      try {
        await source.dispatch({
          type: 'PutDoc',
          domain,
          name: getName(),
          id: block.id,
        });
      } catch (e) {
        setState({
          id: lastId,
          puttingFromId: null,
        });
        throw e;
      }
    } else {
      setState({
        puttingFromId: lastId,
        id: block.id,
      });
      try {
        await source.dispatch({
          type: 'PutDocValue',
          domain,
          name: getName(),
          id: block.id,
          value: block.value.get(),
        });
        block.shamefullySetPutTime();
      } catch (e) {
        setState({
          id: lastId,
          puttingFromId: null,
        });
        throw e;
      }
    }
  }

  const value = createStreamValue(
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
    getBlockOfValue,
    publishValue,
    putValue,
    putBlock,
  };
}
