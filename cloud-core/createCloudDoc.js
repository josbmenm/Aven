import { Observable, BehaviorSubject } from 'rxjs-compat';
import createCloudBlock from './createCloudBlock';
import uuid from 'uuid/v1';
import bindCloudValueFunctions from './bindCloudValueFunctions';
import mapBehaviorSubject from '../utils/mapBehaviorSubject';

function hasDepth(name) {
  return name.match(/\//);
}

export function createDocPool({
  blockValueCache,
  domain,
  source,
  parentName = new BehaviorSubject(null),
  onGetSelf,
  cloudClient,
}) {
  const _docs = {};

  function get(name) {
    if (typeof name !== 'string') {
      throw new Error(
        `Expected a string to be passed to docs.get(). Instead got "${name}"`,
      );
    }
    if (name === '') {
      return onGetSelf();
    }
    if (name[0] === '^') {
      const doc = onGetSelf();
      const evalName = name.slice(1);
      if (evalName === '') {
        throw new Error(
          'Must specify a doc name to evaluate with, when getting a cloud function with the ^ character.',
        );
      }
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
        `Cannot get doc "${docNameWithBlockId}" because the blockId specifier ("#") is defined more than once.`,
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
        source,
        domain,
        name: localName,
        blockValueCache: blockValueCache,
        cloudClient,
        onRename: newName => {
          return move(localName, newName);
        },
        parentName,
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
        `Cannot move from "${fromName}" because it has a slash. Deep moves are not supported yet.`,
      );
    }
    if (hasDepth(toName)) {
      throw new Error(
        `Cannot move to "${toName}" because it has a slash. Deep moves are not supported yet.`,
      );
    }
    const doc = _docs[fromName];
    if (!doc) {
      throw new Error(
        `Cannot move "${fromName}" to "${toName}" because it does not exist`,
      );
    }
    _docs[toName] = doc;
    doc.$setName(toName);
    delete _docs[fromName];
  }

  function post() {
    const localName = uuid();
    const postedDoc = createCloudDoc({
      source,
      domain,
      name: localName,
      blockValueCache: blockValueCache,
      parentName,
      cloudClient,
      onRename: newName => move(localName, newName),
      isUnposted: true,
    });
    _docs[localName] = postedDoc;
    return postedDoc;
  }

  const observeDocChildren = parentName
    .switchMap(parentDocName => {
      return new Observable(observer => {
        let docNames = [];
        let hasMore = true;
        let lastDocSeen = null;
        let upstreamSubs = null;

        async function doLoad() {
          if (!upstreamSubs) {
            upstreamSubs = (await source.observeDocChildren(
              domain,
              parentDocName,
            )).subscribe(childEvt => {
              if (childEvt.type === 'AddChildDoc') {
                // see if this belongs at end of list. We can avoid sorting
                const last = docNames[docNames.length - 1];
                if (last && childEvt.name > last) {
                  docNames = [...docNames, childEvt.name];
                } else {
                  // we need to sort
                  docNames = [...docNames, childEvt.name].sort();
                }
                observer.next(docNames);
              } else if (childEvt.type === 'DestroyChildDoc') {
                if (docNames.indexOf(childEvt.name) !== -1) {
                  docNames = docNames.filter(name => name !== childEvt.name);
                  observer.next(docNames);
                }
              } else {
                throw new Error(`Unrecognized child doc event: ${childEvt}`);
              }
            });
          }
          let result = null;
          try {
            result = await source.dispatch({
              type: 'ListDocs',
              parentName: parentDocName,
              afterName: lastDocSeen,
              domain,
            });
            lastDocSeen = result.docs[result.docs.length - 1];
            docNames = [...docNames, ...result.docs];
            hasMore = result.hasMore;
            observer.next(docNames);
          } catch (e) {
            observer.error(e);
          }
        }
        async function doFullLoad() {
          await doLoad();
          if (hasMore && lastDocSeen) {
            return await doFullLoad();
          }
        }
        doFullLoad()
          .then(() => {})
          .catch(console.error);

        return () => {
          if (upstreamSubs) {
            upstreamSubs.unsubscribe();
          }
        };
      });
    })
    // this is a shared observable of all doc names. Array<string>
    .map(docNames => docNames.map(get))
    // this is now hydrated to real children doc objects Array<CloudDoc>
    .share();

  return { get, move, post, observeDocChildren };
}

export default function createCloudDoc({
  cloudClient,
  source,
  name,
  domain,
  parentName = new BehaviorSubject(null),
  isUnposted,
  onRename,
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
      `doc name ${name} must not contain slashes. Instead, pass a parent`,
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
    const parent = parentName.getValue();
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
      postingInProgress = source.dispatch({
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
    return docState.getValue();
  }

  function getId() {
    return getState().id;
  }

  function getName() {
    const name = getState().name;
    return name;
  }

  function getParentName(parent, localName) {
    if (parent === null) {
      return localName;
    }
    return `${parent}/${localName}`;
  }

  const docName = new BehaviorSubject(
    getParentName(parentName.getValue(), getState().name),
  );

  parentName.subscribe({
    next: parent => {
      docState.subscribe({
        next: state => {
          docName.next(getParentName(parent, state.name));
        },
      });
    },
  });

  function getFullName() {
    return docName.getValue();
  }

  const docs = createDocPool({
    parentName: docName,
    blockValueCache,
    source,
    domain,
    cloudClient,
    onGetSelf: () => cloudDoc,
  });

  async function fetch() {
    if (getState().isConnected) {
      // we are connected via a subscription. we do not need to query
      return;
    }
    const result = await source.dispatch({
      type: 'GetDoc',
      domain,
      name: getFullName(),
    });
    if (result) {
      setState({
        id: result.id,
        lastSyncTime: Date.now(),
      });
    }
  }

  async function destroy() {
    setState({ isConnected: false, id: null, isDestroyed: true });
    await source.dispatch({
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
      const result = await source.dispatch({
        type: 'GetDocValue',
        domain,
        name: getFullName(),
      });
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
    source.observeDoc(domain, myName).then(upstreamObs => {
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
      dispatch: source.dispatch,
      onGetName: getFullName,
      domain,
      id,
      cloudClient,
      blockValueCache,
      cloudDoc,
    }));
    return o;
  }

  function _getBlockWithValue(value) {
    const block = createCloudBlock({
      dispatch: source.dispatch,
      onGetName: getFullName,
      domain,
      value,
      cloudClient,
      blockValueCache,
      cloudDoc,
    });

    if (_docBlocks[block.id]) {
      return _docBlocks[block.id];
    }
    return (_docBlocks[block.id] = block);
  }

  function _getBlockWithValueAndId(value, id) {
    const block = createCloudBlock({
      dispatch: source.dispatch,
      onGetName: getFullName,
      domain,
      value,
      id,
      cloudClient,
      blockValueCache,
      cloudDoc,
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
        }" for getBlock! Expected "BlockReference".`,
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

  let overriddenFunction = null;

  function $setOverrideFunction(fn) {
    overriddenFunction = fn;
  }
  function doFunctionThing(
    pureDataFn,
    argumentValue,
    argumentDoc,
    cloudClient,
  ) {
    const dependencies = new Set();
    async function loadDependencies() {
      await Promise.all(
        [...dependencies].map(async dep => {
          await dep.fetchValue();
        }),
      );
    }
    function useValue(cloudValue) {
      dependencies.add(cloudValue);
      console.log(
        'using value..',
        cloudValue.getFullName(),
        cloudValue.isConnected.getValue(),
      );
      return cloudValue.getValue();
    }
    function computeResult() {
      return pureDataFn(argumentValue, argumentDoc, cloudClient, useValue);
    }
    return {
      getIsConnected: () =>
        ![...dependencies].find(dep => !dep.getIsConnected()),
      dependencies,
      loadDependencies,
      result: computeResult(),
      reComputeResult: computeResult,
    };
  }
  function functionGetValue(argumentDoc) {
    if (overriddenFunction) {
      const { result } = doFunctionThing(
        overriddenFunction,
        argumentDoc.getValue(),
        argumentDoc,
        cloudClient,
      );
      return result;
    }
    const block = getBlock();
    if (!block) {
      return undefined;
    }
    return block.functionGetValue(argumentDoc);
  }

  async function functionFetchValue(argumentDoc) {
    if (overriddenFunction) {
      await argumentDoc.fetchValue();
      const { loadDependencies, reComputeResult } = doFunctionThing(
        overriddenFunction,
        argumentDoc.getValue(),
        argumentDoc,
        cloudClient,
      );
      await loadDependencies();
      return reComputeResult();
    }
    await fetchValue();
    const block = getBlock();
    if (!block) {
      return undefined;
    }
    await block.functionFetchValue(argumentDoc);
  }

  async function put(value) {
    const block = _getBlockWithValue(value);
    await putBlock(block);
    return { id: block.id };
  }

  async function putTransaction(value) {
    const prevId = getId();
    await fetch();
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

    const result = await source.dispatch({
      type: 'PutTransactionValue',
      domain,
      name: getFullName(),
      value,
    });

    if (result.id !== expectedBlock.id) {
      console.warn(
        `Expected to put block id "${expectedBlock.id}", but actually put id "${
          result.id
        }"`,
      );
    }
    return result;
  }

  async function putId(blockId) {
    // err.. shouldn't this be using state.puttingFromId to avoid race conditions??
    // review this and perhaps merge with `putBlock`
    await source.dispatch({
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
        } is in progress`,
      );
    }
    const lastId = state.id;
    setState({
      id: block.id,
      puttingFromId: state.id,
    });
    try {
      if (block.getIsPublished()) {
        await putId(block.id);
      } else {
        await source.dispatch({
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

      throw new Error(
        `Failed to putBlockId "${block.id}" to "${name}". ${e.message}`,
      );
    }
  }

  const observeValue = observe.switchMap(cloudDocValue => {
    if (cloudDocValue.value !== undefined) {
      return Observable.of(cloudDocValue.value);
    }
    if (!cloudDocValue.id) {
      return Observable.of(undefined);
    }
    const block = _getBlockWithId(cloudDocValue.id);
    return block.observeValue;
  });

  const overriddenFunctionResults = new Map();

  const functionObserveValue = (argumentDoc, onIsConnected) => {
    if (overriddenFunction) {
      if (overriddenFunctionResults.has(argumentDoc)) {
        return overriddenFunctionResults.get(argumentDoc);
      }
      const resultObservable = argumentDoc.observeValue
        .flatMap(async argumentValue => {
          const {
            loadDependencies,
            reComputeResult,
            getIsConnected,
          } = doFunctionThing(
            overriddenFunction,
            argumentValue,
            argumentDoc,
            cloudClient,
          );
          onIsConnected(getIsConnected());
          await loadDependencies();
          onIsConnected(getIsConnected());
          const result = reComputeResult();
          return result;
        })
        .share();
      overriddenFunctionResults.set(argumentDoc, resultObservable);
      return resultObservable;
    }
    return observe.switchMap(cloudDocValue => {
      if (!cloudDocValue.id) {
        return Observable.of(undefined);
      }
      const block = _getBlockWithId(cloudDocValue.id);
      return block.functionObserveValue(argumentDoc);
    });
  };

  function lookupDocBlock(inputVal, lookup) {
    let docValue = inputVal;
    lookup.forEach(v => {
      docValue = docValue && docValue[v];
    });
    if (docValue == null) {
      return Observable.of(undefined);
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
          return Observable.of(null);
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

  const isConnected = mapBehaviorSubject(docState, state => state.isConnected);

  const cloudDoc = {
    $setName, // implementation detail of doc moving..?

    get: docs.get,
    post: docs.post,
    observeDocChildren: docs.observeDocChildren,
    getState,
    getId,
    getName,
    getFullName,
    domain,
    fetch,
    put,
    putTransaction,
    putId,
    fetchConnectedValue,
    getConnectedValue,
    getBlock,
    observe,
    observeName: docName,
    destroy,
    observeConnectedValue, // todo, document or remove! (why should people use this instead of expand?)
    transact,

    // cloud value APIs:
    getValue,
    observeValue,
    isConnected,
    getIsConnected: isConnected.getValue,
    fetchValue,
    getReference,
    // todo: serialize?

    functionGetValue,
    functionFetchValue,
    functionObserveValue,
    $setOverrideFunction, // I suppose this is an implementation detail of eval data source
  };

  bindCloudValueFunctions(cloudDoc, cloudClient);

  return cloudDoc;
}
