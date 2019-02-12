import { Observable, BehaviorSubject } from 'rxjs-compat';
import observeNull from './observeNull';
import createCloudBlock from './createCloudBlock';
import uuid from 'uuid/v1';
import bindCloudValueFunctions from './bindCloudValueFunctions';
const pathJoin = require('path').join;

const observeStatic = val =>
  Observable.create(observer => {
    observer.next(val);
  });

export const POSTING_DOC_NAME = Symbol('POSTING_DOC_NAME');

function hasDepth(name) {
  return name.match(/\//);
}

export function createDocPool({
  blockValueCache,
  domain,
  dataSource,
  onGetParentName,
  onGetSelf,
  onDocMiss,
  cloudClient,
}) {
  const _docs = {};

  function get(name) {
    if (name === '') {
      return onGetSelf();
    }
    if (name[0] === '^') {
      const doc = onGetSelf();
      const evalName = name.slice(1);
      const evalDoc = cloudClient.get(evalName);
      return doc.eval(evalDoc);
    }
    const firstEvalTermIndex = name.indexOf('^');
    const evalTerms =
      firstEvalTermIndex === -1
        ? null
        : name.slice(firstEvalTermIndex + 1).split('^');
    const docNameWithBlockId =
      firstEvalTermIndex === -1 ? name : name.slice(0, firstEvalTermIndex);
    const docIdTerms = docNameWithBlockId.split('#');
    const blockId = docIdTerms[1];
    if (docIdTerms.length !== 1 && docIdTerms.length !== 2) {
      throw new Error(
        `Cannot get doc "${docNameWithBlockId}" because the blockId specifier ("#") is defined more than once.`
      );
    }
    const fullName = docIdTerms[0];
    const localName = fullName.split('/')[0];

    let returningCloudValue = null;

    let restOfName = null;
    if (localName.length < fullName.length - 1) {
      restOfName = fullName.slice(localName.length + 1);
    }
    returningCloudValue = _docs[localName];
    if (!returningCloudValue) {
      returningCloudValue = _docs[localName] = createCloudDoc({
        dataSource,
        domain,
        name: localName,
        blockValueCache: blockValueCache,
        onDocMiss,
        cloudClient,
        onRename: newName => {
          return move(localName, newName);
        },
        onGetParentName,
      });
    }
    if (restOfName) {
      returningCloudValue = returningCloudValue.get(restOfName);
    }
    if (blockId) {
      returningCloudValue = returningCloudValue.getBlock(blockId);
    }

    if (evalTerms) {
      evalTerms.forEach(evalTerm => {
        const evalDoc = get(evalTerm);
        returningCloudValue = returningCloudValue.eval(evalDoc);
      });
    }
    return returningCloudValue;
  }

  function move(fromName, toName) {
    if (hasDepth(fromName)) {
      throw new Error(
        `Cannot move from "${fromName}" because it has a slash. Deep moves are not supported yet.`
      );
    }
    if (hasDepth(toName)) {
      throw new Error(
        `Cannot move to "${toName}" because it has a slash. Deep moves are not supported yet.`
      );
    }
    const doc = _docs[fromName];
    if (!doc) {
      throw new Error(
        `Cannot move "${fromName}" to "${toName}" because it does not exist`
      );
    }
    _docs[toName] = doc;
    doc.$setName(toName);
    delete _docs[fromName];
  }

  function post() {
    const localName = uuid();
    const postedDoc = createCloudDoc({
      dataSource,
      domain,
      name: localName,
      blockValueCache: blockValueCache,
      onGetParentName,
      cloudClient,
      onRename: newName => move(localName, newName),
      isUnposted: true,
    });
    _docs[localName] = postedDoc;
    return postedDoc;
  }

  return { get, move, post };
}

export default function createCloudDoc({
  cloudClient,
  dataSource,
  name,
  domain,
  onGetParentName,
  isUnposted,
  onRename,
  onDocMiss,
  ...opts
}) {
  // used for caching the block *values* only. The in-memory block representations are stored on a per-doc basis in _docBlocks
  const blockValueCache = opts.blockValueCache || {};

  // our internal representation of blocks. There may be duplicate IDs elsewhere in the cloud, but the values are saved in the blockValueCache
  const _docBlocks = {};

  if (!name) {
    throw new Error('name must be provided to createCloudDoc!');
  }
  if (name.match(/\//)) {
    throw new Error(
      `doc name ${name} must not contain slashes. Instead, pass a parent`
    );
  }
  if (!domain) {
    throw new Error('domain must be provided to createCloudDoc!');
  }

  const docState = new BehaviorSubject({
    name,
    id: null,
    isConnected: false,
    lastSyncTime: null,
    isDestroyed: false,
    isPosted: !isUnposted,
  });

  let postingInProgress = null;

  async function doPost(block) {
    const parent = onGetParentName();
    const puttingFromId = cloudDoc.id;
    setState({
      id: block.id,
      puttingFromId,
    });
    if (!postingInProgress) {
      let postData = { id: null };
      if (block && block.getValue()) {
        postData = { value: block.getValue() };
      } else if (block) {
        postData = { id: block.id };
      }
      postingInProgress = dataSource.dispatch({
        type: 'PostDoc',
        name: parent,
        domain,
        ...postData,
      });
    }
    let result = null;
    try {
      result = await postingInProgress;
      setState({
        puttingFromId: null,
        lastPutTime: Date.now(),
      });
    } catch (e) {
      setState({
        puttingFromId: null,
        id: puttingFromId,
      });
      throw e;
    } finally {
      postingInProgress = null;
    }
    if (result.name) {
      const resultingChildName = result.name.slice(parent.length + 1);
      onRename(resultingChildName);
      setState({
        isPosted: true,
      });
      if (block.id !== result.id) {
        return null; // probably this is not an error because there may have been race conditions
      }
      return block;
    }
    throw new Error('Could not post this doc!');
  }

  const setState = newState => {
    docState.next({
      ...docState.value,
      ...newState,
    });
  };

  function getState() {
    return docState.value;
  }

  function getId() {
    return getState().id;
  }

  function getName() {
    const name = docState.value.name;
    return name;
  }

  function getFullName() {
    const name = getName();
    const parent = onGetParentName();
    if (parent) {
      return pathJoin(parent, name);
    }
    return name;
  }

  const docs = createDocPool({
    onGetParentName: getFullName,
    blockValueCache,
    dataSource,
    domain,
    cloudClient,
    onGetSelf: () => cloudDoc,
  });

  async function fetch() {
    const result = await dataSource.dispatch({
      type: 'GetDoc',
      domain,
      name: getFullName(),
    });
    if (result) {
      if (onDocMiss && result.id === null) {
        onDocMiss(getFullName());
      }
      setState({
        id: result.id,
        lastSyncTime: Date.now(),
      });
    }
  }

  async function destroy() {
    setState({ isConnected: false, id: null, isDestroyed: true });
    await dataSource.dispatch({
      type: 'DestroyDoc',
      domain,
      name: getFullName(),
    });
  }

  async function fetchValue() {
    if (getFullName().length > 255) {
      throw new Error('Name is too long. Probably a recursive loop');
    }
    if (getBlock()) {
      // we have a previous existing block. do a fetch (which only checks the ID)
      await fetch();
      const block = getBlock();
      if (block) {
        // this will be a no-op if the block has already been fetched
        await block.fetch();
      }
    } else {
      const result = await dataSource.dispatch({
        type: 'GetDocValue',
        domain,
        name: getFullName(),
      });
      if (onDocMiss && result.id === undefined) {
        const missResult = await onDocMiss(getFullName());
        if (missResult.value) {
          const block = _getBlockWithValue(missResult.value);
          await putBlock(block);
          return;
        }
      }
      if (result.id && result.value !== undefined) {
        _getBlockWithValueAndId(result.value, result.id);
      }
      setState({
        id: result.id,
        lastSyncTime: Date.now(),
      });
    }
    return getValue();
  }
  const observe = Observable.create(observer => {
    // todo, re-observe when name changes!!
    let upstreamSubscription = null;
    const myName = getFullName();
    dataSource.observeDoc(domain, myName).then(upstreamObs => {
      setState({ isConnected: true });
      upstreamSubscription = upstreamObs.subscribe({
        next: upstreamDoc => {
          if (upstreamDoc === undefined) {
            return;
          }
          setState({
            id: upstreamDoc.id,
            lastSyncTime: Date.now(),
            value: upstreamDoc.value,
          });
          observer.next(docState.value);
        },
      });
    });

    return () => {
      setState({ isConnected: false });
      upstreamSubscription && upstreamSubscription.unsubscribe();
    };
  })
    .multicast(() => new BehaviorSubject(docState.value))
    .refCount();

  function _getBlockWithId(id) {
    if (_docBlocks[id]) {
      return _docBlocks[id];
    }
    const o = (_docBlocks[id] = createCloudBlock({
      dispatch: dataSource.dispatch,
      onGetName: getFullName,
      domain,
      id,
      cloudClient,
      blockValueCache,
    }));
    return o;
  }

  function _getBlockWithValue(value) {
    const block = createCloudBlock({
      dispatch: dataSource.dispatch,
      onGetName: getFullName,
      domain,
      value,
      cloudClient,
      blockValueCache,
    });

    if (_docBlocks[block.id]) {
      return _docBlocks[block.id];
    }
    return (_docBlocks[block.id] = block);
  }

  function _getBlockWithValueAndId(value, id) {
    const block = createCloudBlock({
      dispatch: dataSource.dispatch,
      onGetName: getFullName,
      domain,
      value,
      id,
      cloudClient,
      blockValueCache,
    });

    if (_docBlocks[id]) {
      return _docBlocks[id];
    }
    return (_docBlocks[id] = block);
  }

  function getBlock(requestedId) {
    // this method is extremely confusing. it currently means:
    // - "get a block with this id", or
    // - "get a doc with this BlockReference object", or
    // - "get your current active block"

    if (
      typeof requestedId === 'object' &&
      requestedId.type !== 'BlockReference'
    ) {
      throw new Error(
        `Bad reference type "${
          requestedId.type
        }" for getBlock! Expected "BlockReference".`
      );
    }
    const queryId =
      typeof requestedId === 'string'
        ? requestedId
        : requestedId && requestedId.id;

    if (queryId) {
      return _getBlockWithId(queryId);
    }
    const { id } = docState.value;
    if (!id) {
      return undefined;
    }
    return _getBlockWithId(id);
  }

  function getValue() {
    const { id, value } = docState.value;
    if (value) {
      return value;
    }
    if (!id) {
      return undefined;
    }
    const block = _getBlockWithId(id);
    return block.getValue();
  }

  async function put(value) {
    const block = _getBlockWithValue(value);
    await putBlock(block);
    return { id: block.id };
  }

  async function putTransaction(value) {
    const prevId = getId();
    const expectedTransactionValue = {
      type: 'TransactionValue',
      on: {
        type: 'BlockReference',
        id: prevId,
      },
      value,
    };
    const expectedBlock = _getBlockWithValue(expectedTransactionValue);

    setState({
      id: expectedBlock.id,
      puttingFromId: prevId,
    });

    const result = await dataSource.dispatch({
      type: 'PutTransactionValue',
      domain,
      name: getFullName(),
      value,
    });

    if (result.id !== expectedBlock.id) {
      throw new Error('w0t m8');
    }
    return result;
  }

  async function putId(blockId) {
    // err.. shouldn't this be using state.puttingFromId to avoid race conditions??
    // review this and perhaps merge with `putBlock`
    await dataSource.dispatch({
      type: 'PutDoc',
      domain,
      name: getFullName(),
      id: blockId,
    });
  }

  let postingPromise = null;

  async function putBlock(block) {
    let postResult = null;
    if (!docState.value.isPosted && !postingPromise) {
      postingPromise = doPost(block);
      await postingPromise;
      postingPromise = null;
      return;
    }

    if (postingPromise) {
      await postingPromise;
    }

    if (postResult === block) {
      return;
    }

    const state = getState();
    if (state.puttingFromId) {
      console.log(
        `Warning.. putBlock of "${name}" while another put from ${
          state.puttingFromId
        } is in progress`
      );
    }
    const lastId = state.id;
    setState({
      id: block.id,
      puttingFromId: state.id,
    });
    try {
      if (block.isPublished()) {
        await putId(block.id);
      } else {
        await dataSource.dispatch({
          type: 'PutDocValue',
          domain,
          name: getFullName(),
          id: block.id,
          value: block.getValue(),
        });
        block.setPutTime();
      }

      setState({
        puttingFromId: null,
        lastPutTime: Date.now(),
      });
    } catch (e) {
      setState({
        puttingFromId: null,
        id: lastId,
      });
      console.error(e);
      throw new Error(`Failed to putBlockId "${block.id}" to "${name}"!`);
    }
  }

  const observeValue = observe
    .map(cloudDocValue => {
      if (cloudDocValue.value !== undefined) {
        return observeStatic(cloudDocValue.value);
      }
      if (!cloudDocValue.id) {
        return observeNull;
      }
      const block = _getBlockWithId(cloudDocValue.id);
      return block.observeValue;
    })
    .switch();

  function lookupDocBlock(inputVal, lookup) {
    let docValue = inputVal;
    lookup.forEach(v => {
      docValue = docValue && docValue[v];
    });
    if (docValue == null) {
      return observeNull;
    }
    if (typeof docValue !== 'string') {
      throw new Error(`Cannot look up block ID in ${name} on ${lookup.join()}`);
    }
    const connectedBlock = _getBlockWithId(docValue);
    return connectedBlock;
  }
  function observeConnectedValue(lookup) {
    return observeValue
      .map(value => {
        if (!value) {
          return observeNull;
        }
        const connected = lookupDocBlock(value, lookup);
        return connected.observeValue;
      })
      .switch();
  }

  async function fetchConnectedValue(lookup) {
    await fetchValue();
    const connected = lookupDocBlock(getValue(), lookup);
    if (connected) {
      await connected.fetch();
    }
  }

  async function getConnectedValue(lookup) {
    const block = getBlock();
    const connected = lookupDocBlock(block.value, lookup);
    if (connected) {
      return connected.getValue();
    }
  }

  async function transact(transactionFn) {
    await fetchValue();
    const lastValue = getValue();
    const newValue = transactionFn(lastValue);
    if (lastValue !== newValue) {
      await put(newValue);
    }
  }

  function $setName(newName) {
    setState({
      name: newName,
    });
    // todo, send this to the server!
  }

  function getReference() {
    return {
      type: 'DocReference',
      domain,
      name: getFullName(),
    };
  }

  const cloudDoc = {
    $setName,
    get: docs.get,
    post: docs.post,
    getState,
    getId,
    getName,
    getFullName,
    domain,
    fetch,
    put,
    putTransaction,
    putId,
    fetchValue,
    fetchConnectedValue,
    getConnectedValue,
    getBlock,
    getValue,
    observeValue,
    observe,
    destroy,
    observeConnectedValue,
    transact,
    getReference,
  };

  bindCloudValueFunctions(cloudDoc, cloudClient);

  return cloudDoc;
}
