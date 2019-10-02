// Kite - The lightweight Aven Cloud Client

import getIdOfValue from '../cloud-utils/getIdOfValue';
import Err from '../utils/Err';
import cuid from 'cuid';
import createDispatcher from '../cloud-utils/createDispatcher';
import bindCommitDeepBlock from './bindCommitDeepBlock';
import { createStreamValue } from './StreamValue';
import {
  createProducerStream,
  streamOf,
  streamOfValue,
  streamNever,
  combineStreams,
} from './createMemoryStream';

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

function getNow() {
  return Math.floor(new Date().getTime() / 1000);
}

function hasDepth(name) {
  return name.match(/\//);
}
function valuePluck(o) {
  return o.value;
}
export function valueMap(idAndValue) {
  return idAndValue.map(valuePluck, 'GetValue');
}
export function createStreamDoc(idAndValueStream, docName) {
  const idAndValue = createStreamValue(idAndValueStream, () => docName);
  const value = createStreamValue(valueMap(idAndValueStream), () => docName);

  return {
    type: 'StreamDoc',
    value,
    idAndValue,
    getReference: () => ({
      type: 'StreamDoc',
      name: docName,
    }),
    putValue: () => {
      throw new Error('Cannot PutValue of a stream doc');
    },
    isDestroyed: () => false,
    putTransactionValue: () => {
      throw new Error(`Cannot putTransactionValue on "${docName}"`);
    },
    getId: () => {
      return undefined;
    },
  };
}

export function createBlock({
  domain,
  auth,
  onGetName,
  nameChangeNotifiers,
  source,
  id,
  value,
  onReport,
  onInitialLoad,
}) {
  let observedBlockId = null;

  if (value !== undefined) {
    observedBlockId = getIdOfValue(value).id;
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
      'id and value were both provided to createBlock, but the id does not match the value!',
    );
  }

  if (!blockId) {
    throw new Error('id or value must be provided to createBlock!');
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

  function setBlockState(stateUpdates) {
    blockState = {
      ...blockState,
      ...stateUpdates,
    };
    notifyStateChange && notifyStateChange();
  }

  let onStop = null;
  const blockStream = createProducerStream({
    crumb: 'BlockState-' + blockId,
    start: notify => {
      notifyStateChange = () => {
        notify.next(blockState);
      };
      notifyStateChange();

      const docName = onGetName();

      if (blockState.value !== undefined) {
        return; // no need to load, the value is already here
      }

      let promiseChain = Promise.resolve();

      if (onInitialLoad) {
        promiseChain = promiseChain
          .then(() => onInitialLoad('Block', domain, docName, blockId))
          .then(initState => {
            if (initState) {
              setBlockState({
                value: initState.value,
              });
            }
          })
          .catch(err => {
            console.error(
              'Failure of onInitialLoad of block state',
              { domain, docName, blockId },
              err,
            );
          });
      }

      promiseChain
        .then(() => {
          if (blockState.value === undefined) {
            return source.dispatch({
              type: 'GetBlock',
              domain,
              auth,
              name: docName,
              id: blockId,
            });
          }
        })
        .then(resp => {
          if (blockState.value !== undefined) {
            return;
          }
          if (!resp) {
            throw new Error('Could not load block');
          }
          setBlockState({
            value: resp.value,
            lastFetchTime: getNow(),
          });
        })
        .catch(err => {
          notify.error(err);
        });
    },
    stop: () => {
      if (onStop) {
        onStop();
      }
      notifyStateChange = null;
      onStop = null;
    },
  });
  const blockStateValue = createStreamValue(
    blockStream,
    () => `Block(${onGetName()}#${blockId})`,
  );

  const blockValueStream = blockStream
    .map(blockState => {
      return blockState.value;
    }, 'GetValue')
    .filter(val => {
      return val !== undefined;
    }, 'FilterUndefined');

  const blockValue = createStreamValue(
    blockValueStream,
    () => `Block(${onGetName()}#${blockId}).value`,
  );

  const blockIdAndValueStream = blockValueStream.map(value => {
    return { value, id: blockId };
  }, 'ExpandBlockIdAndValue-' + blockId);

  const blockIdAndValue = createStreamValue(
    blockIdAndValueStream,
    () => `Block(${onGetName()}#${blockId}).idAndValue`,
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
    setBlockState({
      lastPutTime: getNow(),
    });
  }

  function shamefullySetFetchedValue(value) {
    setBlockState({
      lastFetchTime: getNow(),
      value,
    });
  }

  async function put() {
    if (blockState.lastFetchTime || blockState.lastPutTime) {
      return;
    }
    if (blockState.value === undefined) {
      throw new Err('Cannot put empty block');
    }
    onReport && onReport('PutBlock', { id: blockId, value: blockState.value });
    const name = onGetName;
    const resp = await source.dispatch({
      type: 'PutBlock',
      domain,
      auth,
      name,
      value: blockState.value,
    });
    if (resp.id !== blockId) {
      throw new Error(
        `Attempted to put "${name}" block "${blockId}" but the server claims the ID is "${resp.id}"`,
      );
    }
    shamefullySetPutTime();
  }

  async function getId() {
    return blockId;
  }

  const cloudBlock = {
    ...blockStateValue,
    type: 'Block',
    id: blockId,
    getId,
    getReference,
    value: blockValue,
    idAndValue: blockIdAndValue,
    put,
    shamefullySetPutTime,
    shamefullySetFetchedValue,
  };

  return cloudBlock;
}

export function createDoc({
  source,
  domain,
  auth,
  onGetName,
  nameChangeNotifiers,
  isUnposted,
  onDidRename,
  onDidDestroy,
  onReport,
  onInitialLoad,
}) {
  function getName() {
    return onGetName();
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
    id: undefined,
    context: { gen: 0 },
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

  function setDocState(updates) {
    docState = {
      ...docState,
      ...updates,
    };
    notifyStateChange && notifyStateChange();
  }

  let docName = onGetName();
  let doStop = null;
  let performNotification = null;
  const docProducer = {
    crumb: 'DocState-' + docName,
    start: listen => {
      // todo.. add listener to nameChangeNotifiers, then unsubscribe and re-subscribe using new name
      performNotification = () => {
        listen.next(docState);
      };
      performNotification();
      notifyStateChange = () => {
        performNotification && performNotification();
      };

      if (onInitialLoad && docState.id === undefined) {
        onInitialLoad('Doc', domain, docName)
          .then(initState => {
            if (initState && initState.id) {
              if (initState.value) {
                commitBlock(initState.value);
              }
              setDocState({
                id: initState.id,
              });
            } else {
              setDocState({
                id: null,
              });
            }
          })
          .catch(err => {
            console.error(
              'Failure of onInitialLoad of doc state',
              { domain, docName },
              err,
            );
          });
      }

      if (docState.isLocalOnly) {
        return;
      }
      const upStream = source.getDocStream(domain, docName, auth);
      const internalListener = {
        next: v => {
          if (!v) {
            return;
          }
          if (v.value !== undefined) {
            const block = getBlock(v.id);
            block.shamefullySetFetchedValue(v.value);
          }
          setDocState({
            lastFetchTime: getNow(),
            context: v.context,
            id: v.id || null,
          });
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
  const docStream = createProducerStream(docProducer);

  const docStateValue = createStreamValue(docStream, () => `Doc(${getName()})`);

  const docBlocks = {};

  function getBlockOfValue(value) {
    const block = createBlock({
      source,
      domain,
      auth,
      onGetName,
      nameChangeNotifiers,
      value,
      onReport,
      onInitialLoad,
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
    docBlocks[id] = createBlock({
      source,
      domain,
      auth,
      onGetName,
      nameChangeNotifiers,
      id,
      onReport,
      onInitialLoad,
    });

    return docBlocks[id];
  }

  function commitBlock(value) {
    const block = getBlockOfValue(value);
    return { id: block.id };
  }

  const commitDeepBlock = bindCommitDeepBlock(commitBlock);

  async function publishValue(value) {
    const committed = await commitDeepBlock(value);
    const block = getBlockOfValue(committed.value);
    await block.put();
    return block;
  }

  async function putValue(value) {
    const committed = await commitDeepBlock(value);
    const block = getBlockOfValue(committed.value);
    onReport && onReport('PutDocValue', { value, id: block.id });
    await quietlyPutBlock(block);
  }

  function isBlockPublished(block) {
    const blockState = block.get();
    return blockState.lastFetchTime != null || blockState.lastPutTime != null;
  }

  function isBlockValueLoaded(block) {
    const blockState = block.get();
    return blockState.value !== undefined;
  }

  async function quietlyPutBlock(block) {
    if (docState.isLocalOnly) {
      setDocState({ id: block.id });
      return;
    }
    const lastId = docState.id;
    const isPosted = docState.isPosted;

    if (!isPosted) {
      setDocState({
        puttingFromId: lastId,
        id: block.id,
      });

      let postData = { id: null };
      if (block && block.value.get() !== undefined) {
        postData = { value: block.value.get() };
      } else if (block) {
        postData = { id: await block.getId() };
      }

      try {
        const parentName = getParentName();

        const postResp = await source.dispatch({
          type: 'PostDoc',
          domain,
          auth,
          name: parentName,
          ...postData,
        });

        const resultingChildName =
          parentName == null
            ? postResp.name
            : postResp.name.slice(parentName.length + 1);
        await onDidRename(resultingChildName);
        setDocState({
          lastPutTime: getNow(),
          isPosted: true,
        });
        block.shamefullySetPutTime();
      } catch (e) {
        setDocState({
          id: lastId,
          puttingFromId: null,
        });
        throw e;
      }
      return;
    }

    if (
      block === null ||
      isBlockPublished(block) ||
      !isBlockValueLoaded(block)
    ) {
      const putId = block === null ? null : block.id;
      setDocState({
        puttingFromId: lastId,
        id: putId,
      });
      try {
        await source.dispatch({
          type: 'PutDoc',
          domain,
          auth,
          name: getName(),
          id: putId,
        });
        setDocState({
          lastPutTime: getNow(),
        });
      } catch (e) {
        setDocState({
          id: lastId,
          puttingFromId: null,
        });
        throw e;
      }
    } else {
      setDocState({
        puttingFromId: lastId,
        id: block.id,
      });
      try {
        await source.dispatch({
          type: 'PutDocValue',
          domain,
          auth,
          name: getName(),
          id: block.id,
          value: block.value.get(),
        });
        setDocState({
          lastPutTime: getNow(),
        });
        block.shamefullySetPutTime();
      } catch (e) {
        setDocState({
          id: lastId,
          puttingFromId: null,
        });
        throw e;
      }
    }
  }

  async function putBlock(block) {
    onReport &&
      onReport('PutDoc', {
        id: block.id,
      });
    await quietlyPutBlock(block);
  }

  async function _remotePutTransactionValue(value) {
    // an implementation of putTransactionValue, where the change is not expected to be optimistic. This is used by putTransactionValue when the current id of a doc is not known

    const result = await source.dispatch({
      type: 'PutTransactionValue',
      domain,
      auth,
      name: getName(),
      value,
    });
    setDocState({
      id: result.id,
      lastFetchTime: getNow(),
      lastPut: getNow(),
    });
    onReport &&
      onReport('PutDoc', {
        id: result.id,
      });
    return result;
  }

  const emptyIdValueStream = streamOfValue(
    {
      id: null,
      value: undefined,
    },
    'StaticEmptyIdValue',
  );

  async function putTransactionValue(value) {
    if (docState.id === undefined && !docState.isLocalOnly) {
      return _remotePutTransactionValue(value);
    }
    const prevId = docState.id;
    const on = prevId ? { id: prevId, type: 'BlockReference' } : null;
    const expectedTransactionValue = {
      type: 'TransactionValue',
      on,
      value,
    };
    const expectedBlock = getBlockOfValue(expectedTransactionValue);

    onReport &&
      onReport('PutDocValue', {
        id: expectedBlock.id,
        value: expectedTransactionValue,
      });

    if (docState.isLocalOnly) {
      setDocState({
        id: expectedBlock.id,
      });
      return { id: expectedBlock.id };
    }
    setDocState({
      id: expectedBlock.id,
      puttingFromId: prevId,
    });

    const result = await source.dispatch({
      type: 'PutTransactionValue',
      domain,
      auth,
      name: getName(),
      value,
    });

    let stateUpdates = {
      lastPutTime: getNow(),
      puttingFromId: null,
      lastFetchTime: getNow(),
      id: result.id,
    };
    if (result.id !== expectedBlock.id) {
      onReport &&
        onReport('PutDoc', {
          id: result.id,
        });
      console.warn(
        `Expected to put block id "${expectedBlock.id}", but actually put id "${result.id}"`,
      );
    }
    setDocState(stateUpdates);
    return result;
  }

  const docIdAndValue = createStreamValue(
    docStream
      .dropRepeats((a, b) => a.id === b.id, 'DropRepeatedIds')
      .map(state => {
        if (state.id === undefined) {
          return streamNever('UndefinedId');
        }
        if (state.id === null) {
          return emptyIdValueStream;
        }
        const block = getBlock(state.id);
        return block.value.stream.map(val => {
          return {
            value: val,
            id: state.id,
            context: state.context,
          };
        });
      })
      .flatten()
      .dropRepeats((a, b) => {
        return a.id === b.id;
      }, 'DropRepeatedIdValues'),
    () => `Doc(${getName()}).idValue`,
  );

  const docValue = createStreamValue(
    docIdAndValue.stream.map(idAndValue => {
      return idAndValue.value;
    }, 'DocValueStream'),
    () => `Doc(${getName()}).value`,
  );

  const children = createDocSet({
    domain,
    auth,
    source,
    onGetName,
    nameChangeNotifiers,
    onInitialLoad,
  });

  async function destroy() {
    setDocState({ id: null, isDestroyed: true });
    onDidDestroy();
    children.shamefullyDestroyAll();
    await source.dispatch({
      type: 'DestroyDoc',
      domain,
      auth,
      name: getName(),
    });
  }

  async function getId() {
    return docState.id;
  }

  function isDestroyed() {
    return docState.isDestroyed;
  }

  function setLocalOnly(isLocalOnly = true) {
    setDocState({
      isLocalOnly,
    });
  }

  async function transact(transactionFn) {
    // todo.. uh, do this safely by putting a TransactionValue!
    let lastValue = undefined;
    if (docState.isPosted) {
      const { value } = await docIdAndValue.load();
      lastValue = value;
    } else {
      const { value } = docIdAndValue.get();
      lastValue = value;
    }
    const newValue = transactionFn(lastValue);
    if (lastValue !== newValue) {
      await putValue(newValue);
    }
  }

  const cloudDoc = {
    ...docStateValue,
    type: 'Doc',
    transact,
    getId,
    idAndValue: docIdAndValue,
    isDestroyed,
    getReference,
    value: docValue,
    getName,
    getParentName,
    getBlock,
    getBlockOfValue,
    publishValue,
    setLocalOnly,
    destroy,
    putValue,
    putTransactionValue,
    putBlock,
    children,
  };
  return cloudDoc;
}

function parentChildName(parent, child) {
  if (parent) {
    return `${parent}/${child}`;
  }
  return child;
}

export function createDocSet({
  domain,
  auth,
  source,
  onGetName,
  nameChangeNotifiers,
  onReport,
  onInitialLoad,
}) {
  const childDocs = new Map();

  const childDocMovers = new WeakMap();

  function _createChildDoc(name) {
    let currentDocName = name;
    let currentDocFullName = parentChildName(onGetName(), currentDocName);
    const childNameChangeNotifiers = new Set();

    function handleParentRename(newParentName) {
      currentDocFullName = parentChildName(newParentName, currentDocName);
      childNameChangeNotifiers.forEach(notifier =>
        notifier(currentDocFullName),
      );
    }

    function handleRename(newLocalName) {
      onReport &&
        onReport('DocRename', {
          name: prevName,
          newName: currentDocFullName,
        });
      const prevName = currentDocName;
      const childDoc = childDocs.get(currentDocName);
      childDocs.delete(currentDocName);
      currentDocName = newLocalName;
      currentDocFullName = parentChildName(onGetName(), currentDocName);
      childDocs.set(currentDocName, childDoc);
    }

    nameChangeNotifiers && nameChangeNotifiers.add(handleParentRename);

    const newDoc = createDoc({
      source,
      domain,
      auth,
      nameChangeNotifiers: childNameChangeNotifiers,
      onGetName: () => currentDocFullName,
      onDidRename: newLocalName => {
        handleRename(newLocalName);
      },
      onDidDestroy: () => {
        nameChangeNotifiers && nameChangeNotifiers.delete(handleParentRename);
        childNameChangeNotifiers.clear(); // this probably won't be needed because the whole thing should be GC'd
        childDocs.delete(currentDocName);
      },
      onReport: (reportType, report) => {
        onReport &&
          onReport(reportType, {
            ...report,
            name: report.name
              ? `${currentDocName}/${report.name}`
              : currentDocName,
          });
      },
      onInitialLoad,
    });
    childDocs.set(name, newDoc);
    childDocMovers.set(newDoc, handleRename);
    return newDoc;
  }

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
    if (childDocs.has(localName)) {
      returningCloudValue = childDocs.get(localName);
    }

    if (!returningCloudValue) {
      const newDoc = _createChildDoc(localName);
      returningCloudValue = newDoc;
    }
    if (restOfName) {
      if (!returningCloudValue.children) {
        throw new Error(`Cannot get "${restOfName}" within "${name}"`);
      }
      returningCloudValue = returningCloudValue.children.get(restOfName);
    }
    return returningCloudValue;
  }

  function post() {
    const localName = cuid();
    const postedDoc = _createChildDoc(localName);
    return postedDoc;
  }

  function shamefullyDestroyAll() {
    childDocs.clear();
  }

  function setOverrideStream(name, stream) {
    const streamDoc = createStreamDoc(stream, name);
    childDocs.set(name, streamDoc);
    return streamDoc;
  }

  async function move(fromName, toName) {
    if (hasDepth(fromName)) {
      throw new Error(
        `Cannot move from "${fromName}" because it has a slash. Deep moves are not supported yet.`,
      );
    }
    if (hasDepth(toName)) {
      throw new Error(
        `Cannot move to "${toName}" because it has a slash. Deep moves are not supported yet.`,
      );
    }
    const docToMove = childDocs.get(fromName);
    const mover = childDocMovers.get(docToMove);
    if (!mover) {
      throw new Error(
        'Cannot move this doc because we misplaced the ability to do so',
      );
    }
    mover(toName);

    try {
      await source.dispatch({
        type: 'MoveDoc',
        domain,
        from: fromName,
        to: toName,
      });
    } catch (e) {
      mover(fromName);
      throw e;
    }
  }

  function setOverrideValueStream(name, stream, context) {
    return setOverrideStream(
      name,
      stream.map(value => {
        return { value, id: getIdOfValue(value).id };
      }),
      context,
    );
  }

  return {
    get,
    post,
    move,
    setOverrideStream,
    setOverrideValueStream,
    shamefullyDestroyAll,
  };
}

function sourceFromRootDocSet(rootDocSet, domain, source, auth) {
  const sourceId = `CloudClient-${cuid()}`;
  function close() {}

  function getDocStream(subsDomain, name, auth) {
    if (subsDomain !== domain) {
      return source.getDocStream(subsDomain, name, auth);
    }
    const doc = rootDocSet.get(name);
    return doc.idAndValue.stream;
  }

  function getDocChildrenEventStream() {}

  async function sessionDispatch(action) {
    return await source.dispatch({
      ...action,
      ...(auth || {}),
    });
  }

  async function PutDoc({ domain, name, id }) {
    const doc = rootDocSet.get(name);
    const block = id === null ? null : doc.getBlock(id);
    await doc.putBlock(block);
    return { id, name, domain };
  }
  // async function PutBlock() {}

  async function PutDocValue({ name, value }) {
    const doc = rootDocSet.get(name);
    await doc.putValue(value);
    const id = await doc.getId();
    return { id, name, domain };
  }

  async function PutTransactionValue({ name, value }) {
    const doc = rootDocSet.get(name);
    await doc.putTransactionValue(value);
    const id = await doc.get().id;
    return { id, name, domain };
  }

  async function PostDoc({ name, value, id }) {
    const docSet = name == null ? rootDocSet : rootDocSet.get(name).children;
    const newDoc = docSet.post();
    if (value !== undefined) {
      await newDoc.putValue(value);
      // todo check id of newDoc
    } else {
      const block = newDoc.getBlock(id);
      await newDoc.putBlock(block);
    }
    return {
      name: newDoc.getName(),
      id: newDoc.get().id,
    };
  }

  async function GetBlock({ name, id }) {
    const doc = rootDocSet.get(name);
    if (doc.type === 'StreamDoc') {
      throw new Err('Cannot get block of a stream doc, yet, unfortunately');
    }
    const block = doc.getBlock(id);
    const value = await block.value.load();
    return {
      id: block.id,
      value,
    };
  }
  async function GetBlocks({ domain, name, ids }) {
    const results = await Promise.all(
      ids.map(async id => {
        return await GetBlock({ domain, name, id });
      }),
    );
    return { results };
  }
  async function GetDoc({ name }) {
    const doc = rootDocSet.get(name);
    const loaded = await doc.load();
    return {
      id: loaded.id,
      domain,
      name,
    };
  }

  async function GetDocs({ domain, names }) {
    const results = await Promise.all(
      names.map(async name => {
        return await GetDoc({ domain, name });
      }),
    );
    return { results };
  }

  async function GetDocValue({ name }) {
    const doc = rootDocSet.get(name);
    const context = await doc.getReference();
    const results = await doc.idAndValue.load();
    const isDestroyed = doc.isDestroyed();
    if (isDestroyed) {
      return {
        isDestroyed: true,
        value: undefined,
        id: undefined,
        context,
      };
    }
    return { context, ...results };
  }

  async function GetDocValues({ domain, names }) {
    const results = await Promise.all(
      names.map(async name => {
        return await GetDocValue({ domain, name });
      }),
    );
    return { results };
  }

  async function MoveDoc({ domain, from, to }) {
    await rootDocSet.move(from, to);
  }

  async function DestroyDoc({ domain, name }) {
    const doc = rootDocSet.get(name);
    await doc.destroy();
  }

  return {
    close,
    getDocStream,
    getDocChildrenEventStream,

    dispatch: createDispatcher(
      {
        PutDoc,
        // PutBlock,
        PutDocValue,
        PutTransactionValue,
        PostDoc,
        GetBlock,
        GetBlocks,
        GetDoc,
        GetDocs,
        GetDocValue,
        GetDocValues,

        // GetStatus,
        // ListDomains,
        // ListDocs,
        DestroyDoc,
        MoveDoc,
      },
      sessionDispatch,
      domain,
      sourceId,
    ),
    id: sourceId,
  };
}

export function createReducerStream(
  doc,
  reducerFn,
  initialState,
  reducerName,
  { snapshotsDoc } = { snapshotsDoc: null },
) {
  const docStateStreams = new Map();

  function getDocStateStream(id) {
    if (id === undefined) {
      return streamNever('UndefinedId');
    }
    if (id === null) {
      const [stream] = streamOf(
        { value: initialState, id: getIdOfValue(initialState).id },
        'NoActionStateStream',
      );
      return stream;
    }
    if (docStateStreams.has(id)) {
      return docStateStreams.get(id);
    }
    const actionBlock = doc.getBlock(id);

    const docStateStream = actionBlock.idAndValue.stream
      .map(actionDocState => {
        const actionDocId = actionDocState.id;
        const actionDocValue = actionDocState.value;
        const actionValue = actionDocValue.value;

        let [prevStateStream] = streamOf({
          value: initialState,
          id: getIdOfValue(initialState).id,
        });
        if (actionDocValue.on && actionDocValue.on.type === 'BlockReference') {
          prevStateStream = getDocStateStream(actionDocValue.on.id);
        }
        return prevStateStream.map(lastState => {
          const newState = reducerFn(lastState.value, actionValue);
          const newId = getIdOfValue(newState).id;
          return {
            value: newState,
            id: newId,
            context: {
              type: 'ReducedStream',
              reducerName,
              docName: doc.getName(),
              docId: actionDocId,
              prevStateId: lastState.id,
              gen: (lastState.context ? lastState.context.gen : 0) + 1,
            },
          };
        });
      })
      .flatten();

    docStateStreams.set(id, docStateStream);
    return docStateStream;
  }
  if (!snapshotsDoc) {
    return doc.stream
      .map(docState => {
        return getDocStateStream(docState.id);
      })
      .flatten()
      .dropRepeats((a, b) => {
        return a.id === b.id;
      }, 'DropRepeatedIdValues');
  }
  return combineStreams({
    sourceDoc: doc.stream,
    snapshotValue: snapshotsDoc.value.stream,
  })
    .map(({ snapshotValue, sourceDoc }) => {
      if (
        snapshotValue &&
        snapshotValue.context &&
        snapshotValue.context.reducerName === reducerName
      ) {
        const { docId } = snapshotValue.context;
        if (!docStateStreams.has(docId)) {
          const [docStateStream] = streamOf(snapshotValue);
          docStateStreams.set(docId, docStateStream);
        }
      }
      return getDocStateStream(sourceDoc.id);
    })
    .flatten()
    .dropRepeats((a, b) => {
      return a.id === b.id;
    }, 'DropRepeatedIdValues');
}

export function createSessionClient({
  domain,
  source,
  auth,
  onReport,
  onInitialLoad,
}) {
  const docs = createDocSet({
    domain,
    source,
    auth,
    onGetName: () => null,
    nameChangeNotifiers: null,
    onReport: (reportType, report) => {
      onReport && onReport(reportType, { ...report, domain });
    },
    onInitialLoad,
  });

  function setReducer(
    resultStateDocName,
    { reducer, actionsDoc, snapshotInterval, snapshotsDoc },
  ) {
    const stream = createReducerStream(
      actionsDoc,
      reducer.reducerFn,
      reducer.initialState,
      reducer.reducerName,
      {
        snapshotsDoc,
      },
    ).spy(async update => {
      if (update.next) {
        const { context, id, value } = update.next;
        const lastSnapshot = await snapshotsDoc.value.load();
        if (
          lastSnapshot === undefined ||
          lastSnapshot.context == undefined ||
          lastSnapshot.context.gen <= context.gen - snapshotInterval
        ) {
          await snapshotsDoc.putValue({ context, id, value });
        }
      }
    });
    docs.setOverrideStream(resultStateDocName, stream);
  }
  return {
    type: 'AuthenticatedClient',
    docs,
    connected: source.connected,
    get: docs.get,
    setReducer,
    ...sourceFromRootDocSet(docs, domain, source, auth),
  };
}

export function createLocalSessionClient({
  onReport,
  localSource,
  ...clientOpts
}) {
  function handleAsyncStorageFailure(err, ctx) {
    console.error('Failed to save locally.', err, ctx);
  }

  function clientReport(reportName, report) {
    const { id, name, domain, value } = report;
    if (reportName === 'PutDocValue') {
      localSource
        .dispatch({ type: 'PutDocValue', domain, name, id, value })
        .catch(err => handleAsyncStorageFailure(err, { reportName, report }));
    } else if (reportName === 'PutDoc') {
      localSource
        .dispatch({ type: 'PutDoc', domain, name, id })
        .catch(err => handleAsyncStorageFailure(err, { reportName, report }));
    } else if (reportName === 'PutBlock') {
      localSource
        .dispatch({ type: 'PutBlock', domain, name, id, value })
        .catch(err => handleAsyncStorageFailure(err, { reportName, report }));
    }
    onReport && onReport(reportName, report);
  }

  const sessionClient = createSessionClient({
    ...clientOpts,
    onReport: clientReport,
    onInitialLoad: async (blockOrDoc, domain, name, blockId) => {
      if (blockOrDoc === 'Doc') {
        const result = await localSource.dispatch({
          type: 'GetDocValue',
          domain,
          name,
        });
        return result;
      }
      if (blockOrDoc === 'Block') {
        const result = await localSource.dispatch({
          type: 'GetBlock',
          domain,
          name,
          id: blockId,
        });
        return result;
      }
      return null;
    },
  });

  return sessionClient;
}

export function createClient({ domain, source, onReport }) {
  let clientState = {};

  let performStateNotification = null;

  let sessionClient = createSessionClient({
    domain,
    source,
    auth: null,
    onReport,
  });

  function setClientState(updates) {
    let prevClientState = clientState;
    clientState = {
      ...clientState,
      ...updates,
    };
    if (clientState.session !== prevClientState.session) {
      sessionClient = createSessionClient({
        domain,
        source,
        auth: clientState.session,
        onReport,
      });
    }
    performStateNotification && performStateNotification();
  }

  const clientStateValue = createStreamValue(
    createProducerStream({
      crumb: 'ClientState',
      start: listen => {
        performStateNotification = () => {
          listen.next(clientState);
        };
        performStateNotification();
      },
      stop: () => {
        performStateNotification = null;
      },
    }),
  );
  async function establishAnonymousSession() {
    if (clientState.session) {
      return clientState.session;
    }
    const created = await source.dispatch({
      type: 'CreateAnonymousSession',
      domain,
    });
    if (created && created.session) {
      setClientState({
        session: created.session,
      });
    }
    return created;
  }
  return {
    type: 'Client',
    establishAnonymousSession,
    getCloud: () => sessionClient,
    connected: source.connected,
    ...clientStateValue,
  };
}
