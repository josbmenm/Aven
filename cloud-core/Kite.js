// Kite - The lightweight Aven Cloud Client

import xs from 'xstream';
import getIdOfValue from '../cloud-utils/getIdOfValue';
import Err from '../utils/Err';
import cuid from 'cuid';

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

  async function getReference() {
    // why is this async? good question. Eventually, we should make block checksumming lazy, so unlike the current implementation, the id may not be ready yet
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

  async function getId() {
    return blockId;
  }

  const cloudBlock = {
    ...blockStateValue,
    id: blockId,
    getId,
    getReference,
    value: blockValue,
    put,
    shamefullySetPutTime,
  };

  return cloudBlock;
}

export function createDoc({
  source,
  domain,
  nameStream,
  isUnposted,
  onDidRename,
}) {
  function getName() {
    return streamGet(nameStream);
  }

  function getParentName() {
    const name = getName();
    const nameParts = name.split('/');
    if (nameParts.length === 1) {
      return null;
    }
    return nameParts.slice(0, -1).join('/');
  }

  let docState = {
    isPosted: !isUnposted,
    lastFetchTime: null,
    lastPutTime: null,
    id: null,
  };

  async function getReference() {
    // why is this async? good question. Eventually, we should make block checksumming lazy, so unlike the current implementation, the id may not be ready yet
    return {
      type: 'DocReference',
      domain,
      name: getName(),
      id: docState.id,
    };
  }

  let notifyStateChange = null;

  function setState(updates) {
    docState = {
      ...docState,
      ...updates,
    };
    notifyStateChange && notifyStateChange();
  }

  const docStream = nameStream
    .map(name => {
      let doStop = null;
      let performNotification = null;
      const docProducer = {
        start: listen => {
          performNotification = () => {
            listen.next(docState);
          };
          performNotification();
          notifyStateChange = () => {
            performNotification && performNotification();
          };
          const upStream = source.getDocStream(domain, name);
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
          performNotification = null;
          doStop && doStop();
          doStop = null;
        },
      };
      return xs.createWithMemory(docProducer);
    })
    .flatten()
    .remember()
    .debug(() => {});

  const loadedDocStream = docStream.filter(docState => {
    return docState.lastFetchTime != null || docState.lastPutTime != null;
  });

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
    const isPosted = docState.isPosted;

    if (!isPosted) {
      setState({
        puttingFromId: lastId,
        id: block.id,
      });

      let postData = { id: null };
      if (block && block.value.get()) {
        postData = { value: block.value.get() };
      } else if (block) {
        postData = { id: await block.getId() };
      }

      try {
        const parentName = getParentName();
        const postResp = await source.dispatch({
          type: 'PostDoc',
          domain,
          name: parentName,
          ...postData,
        });
        const resultingChildName =
          parentName == null
            ? postResp.name
            : postResp.name.slice(parentName.length + 1);
        onDidRename(resultingChildName);
        setState({
          lastPutTime: Date.now(),
          isPosted: true,
        });
        block.shamefullySetPutTime();
      } catch (e) {
        setState({
          id: lastId,
          puttingFromId: null,
        });
        throw e;
      }
      return;
    }

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
        setState({
          lastPutTime: Date.now(),
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
        setState({
          lastPutTime: Date.now(),
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

  async function putTransactionValue(value) {
    let onCleanup = null;

    const startingDocState = await new Promise((resolve, reject) => {
      let hasResolved = false;
      const listen = {
        next: v => {
          if (hasResolved) {
            // may be a race condition where the value changes at the same time we are transacting on it, or this can be the actual id we are putting.
          } else {
            resolve(v);
          }
        },
        error: err => {
          reject(err);
        },
        complete: () => {},
      };
      loadedDocStream.addListener(listen);
      onCleanup = () => {
        loadedDocStream.removeListener(listen);
      };
    });
    const prevId = startingDocState.id;
    const expectedTransactionValue = {
      type: 'TransactionValue',
      on: {
        type: 'BlockReference',
        id: prevId,
      },
      value,
    };
    const expectedBlock = getBlockOfValue(expectedTransactionValue);

    setState({
      id: expectedBlock.id,
      puttingFromId: prevId,
    });

    const result = await source.dispatch({
      type: 'PutTransactionValue',
      domain,
      name: getName(),
      value,
    });

    setState({
      lastPutTime: Date.now(),
    });
    if (result.id !== expectedBlock.id) {
      console.warn(
        `Expected to put block id "${expectedBlock.id}", but actually put id "${
          result.id
        }"`,
      );
    }

    onCleanup && onCleanup();
    return result;
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

  const children = createDocSet({ domain, source, nameStream });

  return {
    ...docStateValue,
    getReference,
    value,
    getName,
    getBlock,
    getBlockOfValue,
    publishValue,
    putValue,
    putTransactionValue,
    putBlock,
    children,
  };
}

function combineNameStreams(parentStream, nameStream) {
  return xs
    .combine(parentStream, nameStream)
    .map(([parent, name]) => {
      if (parent) {
        return `${parent}/${name}`;
      }
      return name;
    })
    .remember()
    .debug(v => {}); // uhh, remember doesnt seem to work until this debug is here....???
}

export function createDocSet({ domain, source, nameStream }) {
  const _docs = {};

  const childNameStreams = new Map();
  const childDocs = new WeakMap();

  function get(name) {
    if (typeof name !== 'string') {
      throw new Err(
        `Expected a string to be passed to DocSet.get(). Instead got "${name}"`,
      );
    }
    const localName = name.split('/')[0];
    if (!localName) {
      throw new Err('Invalid name to get');
    }
    let returningCloudValue = null;

    let restOfName = null;
    if (localName.length < name.length - 1) {
      restOfName = name.slice(localName.length + 1);
    }
    if (childNameStreams.has(localName)) {
      returningCloudValue = childDocs.get(childNameStreams.get(localName));
    }

    if (!returningCloudValue) {
      const childNameStream = xs.createWithMemory();
      childNameStream.shamefullySendNext(localName);
      const newDoc = createDoc({
        source,
        domain,
        nameStream: combineNameStreams(nameStream, childNameStream),
      });
      childNameStreams.set(localName, childNameStream);
      childDocs.set(childNameStream, newDoc);
      returningCloudValue = newDoc;
    }
    if (restOfName) {
      returningCloudValue = returningCloudValue.children.get(restOfName);
    }
    return returningCloudValue;
  }

  function post() {
    const localName = cuid();
    const childNameStream = xs.createWithMemory();
    childNameStream.shamefullySendNext(localName);
    const postedDoc = createDoc({
      source,
      domain,
      nameStream: combineNameStreams(nameStream, childNameStream),
      isUnposted: true,
      onDidRename: newLocalName => {
        childNameStream.shamefullySendNext(newLocalName);
      },
    });
    childNameStreams.set(localName, childNameStream);
    childDocs.set(childNameStream, postedDoc);
    return postedDoc;
  }

  return {
    get,
    post,
  };
}
