// Kite - The lightweight Aven Cloud Client

import xs from 'xstream';
import getIdOfValue from '../cloud-utils/getIdOfValue';
import Err from '../utils/Err';
import cuid from 'cuid';
import createDispatcher from '../cloud-utils/createDispatcher';
import bindCommitDeepBlock from './bindCommitDeepBlock';
import { createStreamValue, streamGet } from './StreamValue';
import dropRepeats from 'xstream/extra/dropRepeats';

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

export function createStreamDoc(stream, reference) {
  const value = createStreamValue(stream, () => reference);
  const idAndValue = createStreamValue(
    stream.map(val => {
      const id = getIdOfValue(val).id;
      return {
        id,
        value: val,
      };
    }),
    () => `${reference}.value`,
  );
  return {
    type: 'StreamDoc',
    value,
    idAndValue,
    getReference: () => reference,
    isDestroyed: () => false,
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

  function setState(stateUpdates) {
    blockState = {
      ...blockState,
      ...stateUpdates,
    };
    notifyStateChange && notifyStateChange();
  }

  let onStop = null;
  const blockStream = xs.createWithMemory({
    start: notify => {
      notifyStateChange = () => {
        notify.next(blockState);
      };
      notifyStateChange();
      if (blockState.value === undefined) {
        source
          .dispatch({
            type: 'GetBlock',
            domain,
            auth,
            name: onGetName(),
            id: blockId,
          })
          .then(resp => {
            if (!resp) {
              throw new Error('Could not load block');
            }
            blockState = {
              ...blockState,
              value: resp.value,
              lastFetchTime: getNow(),
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
  const blockStateValue = createStreamValue(
    blockStream,
    () => `Block(${onGetName()}#${blockId})`,
  );

  const blockValue = createStreamValue(
    blockStream
      .map(blockState => {
        return blockState.value;
      })
      .filter(val => {
        return val !== undefined;
      }),
    () => `Block(${onGetName()}#${blockId}).value`,
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
      lastPutTime: getNow(),
    });
  }

  function shamefullySetFetchedValue(value) {
    setState({
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

  let _subsToName = onGetName();
  let doStop = null;
  let performNotification = null;
  const docProducer = {
    start: listen => {
      // todo.. add listener to nameChangeNotifiers, then unsubscribe and re-subscribe using new name
      performNotification = () => {
        listen.next(docState);
      };
      performNotification();
      notifyStateChange = () => {
        performNotification && performNotification();
      };
      if (docState.isLocalOnly) {
        return;
      }
      const upStream = source.getDocStream(domain, _subsToName, auth);
      const internalListener = {
        next: v => {
          if (!v) {
            return;
          }
          if (v.value !== undefined) {
            const block = getBlock(v.id);
            block.shamefullySetFetchedValue(v.value);
          }
          setState({
            lastFetchTime: getNow(),
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
  const docStream = xs.createWithMemory(docProducer);

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
    await putBlock(block);
  }

  function isBlockPublished(block) {
    const blockState = block.get();
    return blockState.lastFetchTime != null || blockState.lastPutTime != null;
  }

  function isBlockValueLoaded(block) {
    const blockState = block.get();
    return blockState.value !== undefined;
  }

  async function putBlock(block) {
    if (docState.isLocalOnly) {
      setState({ id: block.id });
      return;
    }
    const lastId = docState.id;
    const isPosted = docState.isPosted;

    if (!isPosted) {
      setState({
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
        setState({
          lastPutTime: getNow(),
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

    if (
      block === null ||
      isBlockPublished(block) ||
      !isBlockValueLoaded(block)
    ) {
      const putId = block === null ? null : block.id;
      setState({
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
        setState({
          lastPutTime: getNow(),
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
          auth,
          name: getName(),
          id: block.id,
          value: block.value.get(),
        });
        setState({
          lastPutTime: getNow(),
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
    const prevId = docState.id;
    const on = prevId ? { id: prevId, type: 'BlockReference' } : null;
    const expectedTransactionValue = {
      type: 'TransactionValue',
      on,
      time: getNow(),
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
      // console.warn(
      //   `Expected to put block id "${expectedBlock.id}", but actually put id "${result.id}"`,
      // );
    }
    setState(stateUpdates);

    onCleanup && onCleanup();
    return result;
  }

  const docValue = createStreamValue(
    docStream
      .map(state => state.id)
      .compose(dropRepeats())
      .map(docId => {
        if (docId === undefined) {
          return xs.never();
        }
        if (docId === null) {
          return xs.of(undefined);
        }
        const block = getBlock(docId);
        return block.value.stream;
      })
      .flatten(),
    () => `Doc(${getName()}).value`,
  );

  const docIdAndValue = createStreamValue(
    docStream
      .map(state => {
        if (state.id === undefined) {
          return xs.never();
        }
        if (state.id === null) {
          return xs.of({ id: null, value: undefined });
        }
        const block = getBlock(state.id);
        return block.value.stream.map(val => ({ value: val, id: state.id }));
      })
      .flatten(),
    () => `Doc(${getName()}).idValue`,
  );

  const children = createDocSet({
    domain,
    auth,
    source,
    onGetName,
    nameChangeNotifiers,
  });

  async function destroy() {
    setState({ id: null, isDestroyed: true });
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

  function setLocalOnly() {
    setState({
      isLocalOnly: true,
      id: docState.id || null,
    });
  }

  async function transact(transactionFn) {
    // todo.. uh, do this safely by putting a TransactionValue!
    let lastValue = undefined;
    if (docState.isPosted) {
      const { value, id } = await docIdAndValue.load();
      lastValue = value;
    } else {
      const { value, id } = docIdAndValue.get();
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

  function setOverrideStream(name, stream, context) {
    const streamDoc = createStreamDoc(stream, context || name);
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

  return {
    get,
    post,
    move,
    setOverrideStream,
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
        // CollectGarbage,
        MoveDoc,
      },
      sessionDispatch,
      domain,
      sourceId,
    ),
    id: sourceId,
  };
}

export function createSessionClient({ domain, source, auth }) {
  const docs = createDocSet({
    domain,
    source,
    auth,
    onGetName: () => null,
    nameChangeNotifiers: null,
  });

  return {
    type: 'AuthenticatedClient',
    docs,
    connected: source.connected,
    get: docs.get,
    ...sourceFromRootDocSet(docs, domain, source, auth),
  };
}

export function createClient({ domain, source }) {
  let clientState = {};

  let performStateNotification = null;

  let sessionClient = createSessionClient({ domain, source, auth: null });

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
      });
    }
    performStateNotification && performStateNotification();
  }

  const clientStateValue = createStreamValue(
    xs.createWithMemory({
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
