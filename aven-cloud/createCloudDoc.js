import { Observable, BehaviorSubject } from 'rxjs-compat';
import { filter } from 'rxjs/operators';
import observeNull from './observeNull';
import createCloudBlock from './createCloudBlock';
import uuid from 'uuid/v1';
const pathJoin = require('path').join;

const observeStatic = val =>
  Observable.create(observer => {
    observer.next(val);
  });

export const POSTING_DOC_NAME = Symbol('POSTING_DOC_NAME');

function hasDepth(name) {
  return name.match(/\//);
}

function filterUndefined() {
  return filter(value => value !== undefined);
}

function computeLambdaResult(doc, lambdaDoc, cloudClient, options) {
  const lambdaValue = lambdaDoc.getValue();

  const evalCode = `({useValue}) => {
    // console.log = () => {};
    return ${lambdaValue.code};
  }`;

  const lambdaContext = eval(evalCode);

  const dependencies = new Set();
  function useValue(cloudValue) {
    dependencies.add(cloudValue);
    return cloudValue.getValue();
  }
  const lambda = lambdaContext({ useValue });

  function computeResult() {
    const thisValue = doc.getValue();
    return lambda(thisValue, doc, cloudClient, options);
  }

  return {
    result: computeResult(),
    dependencies,
    reComputeResult: computeResult,
  };
}

export function createDocPool({
  blockCache,
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
    const executionTerms = name.split('^');
    const restExecutionTerms = executionTerms.slice(1);
    const docIdTerms = executionTerms[0].split('#');
    const blockId = docIdTerms[1];
    if (docIdTerms.length !== 1 && docIdTerms.length !== 2) {
      throw new Error(
        `Cannot get doc "${
          executionTerms[0]
        }" because the blockId specifier ("#") is defined more than once!`,
      );
    }
    const fullName = docIdTerms[0];
    const localName = fullName.split('/')[0];
    let restOfName = null;
    if (localName.length < fullName.length - 1) {
      restOfName = fullName.slice(localName.length + 1);
    }
    let doc = _docs[localName];
    if (!doc) {
      doc = _docs[localName] = createCloudDoc({
        dataSource,
        domain,
        name: localName,
        blockCache: blockCache,
        onDocMiss,
        onRename: newName => {
          return move(localName, newName);
        },
        onGetParentName,
      });
    }
    if (restOfName) {
      doc = doc.get(restOfName);
    }
    if (blockId) {
      const block = doc.getBlock(blockId);
      return block;
    }
    return doc;
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
      dataSource,
      domain,
      name: localName,
      blockCache: blockCache,
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
  const blockCache = opts.blockCache || {};

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
    blockCache,
    dataSource,
    domain,
    onGetSelf: () => cloudDoc,
  });

  async function fetch() {
    const result = await dataSource.dispatch({
      type: 'GetDoc',
      domain,
      name: getFullName(),
    });
    if (result) {
      if (result.id === null) {
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
      if (result.id === undefined) {
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

  function _namedDispatch(action) {
    return dataSource.dispatch({
      ...action,
      domain,
      name: getFullName(),
    });
  }
  function _getBlockWithId(id) {
    if (blockCache[id]) {
      return blockCache[id];
    }
    const o = (blockCache[id] = createCloudBlock({
      onNamedDispatch: _namedDispatch,
      id,
    }));
    return o;
  }

  function _getBlockWithValue(value) {
    const block = createCloudBlock({
      onNamedDispatch: _namedDispatch,
      value,
    });

    if (blockCache[block.id]) {
      return blockCache[block.id];
    }
    return (blockCache[block.id] = block);
  }

  function _getBlockWithValueAndId(value, id) {
    const block = createCloudBlock({
      onNamedDispatch: _namedDispatch,
      value,
      id,
    });

    if (blockCache[id]) {
      return blockCache[id];
    }
    return (blockCache[id] = block);
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

  async function put(value) {
    const block = _getBlockWithValue(value);
    await putBlock(block);
    return { id: block.id };
  }

  async function putTransaction(value) {
    const result = await dataSource.dispatch({
      type: 'PutTransactionValue',
      domain,
      name: getFullName(),
      value,
    });

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
        } is in progress`,
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

  function flatArray(a) {
    return [].concat.apply([], a);
  }

  function expand(expandFn) {
    function isCloudValue(o) {
      return (
        o != null &&
        typeof o === 'object' &&
        typeof o.observeValue === 'object' &&
        typeof o.observeValue.subscribe === 'function' &&
        typeof o.fetchValue === 'function' &&
        typeof o.getValue === 'function'
      );
    }
    function doExpansion(o) {
      if (o == null) {
        return [];
      } else if (isCloudValue(o)) {
        return o.getValue();
      } else if (o instanceof Array) {
        return o.map(doExpansion);
      } else if (typeof o === 'object') {
        const out = {};
        Object.keys(o).forEach(k => {
          out[k] = doExpansion(o[k]);
        });
        return out;
      }
      return o;
    }
    function collectCloudValues(o) {
      if (o == null) {
        return [];
      } else if (isCloudValue(o)) {
        return [o];
      } else if (o instanceof Array) {
        return flatArray(o.map(collectCloudValues));
      } else if (!!o && typeof o === 'object') {
        return flatArray(Object.values(o).map(collectCloudValues));
      }
      return [];
    }
    const expanded = {
      fetchValue: async () => {
        await this.fetchValue();
        const expandSpec = expandFn(this.getValue(), this);
        const cloudValues = collectCloudValues(expandSpec);
        await Promise.all(cloudValues.map(v => v.fetchValue()));
      },
      observeValue: this.observeValue
        .distinctUntilChanged()
        .pipe(filterUndefined())
        .mergeMap(async o => {
          const expandSpec = expandFn(o, this);
          const cloudValues = collectCloudValues(expandSpec);
          await Promise.all(cloudValues.map(v => v.fetchValue()));
          const expanded = doExpansion(expandSpec);
          return expanded;
        })
        .pipe(filterUndefined())
        .distinctUntilChanged(),
      getValue: () => {
        const o = this.getValue();
        const expandSpec = expandFn(o, this);
        const expanded = doExpansion(expandSpec);
        return expanded;
      },
    };
    expanded.map = map.bind(expanded);
    expanded.expand = expand.bind(expanded);
    expanded.eval = evalDoc.bind(expanded);
    return expanded;
  }

  function map(mapFn) {
    const mapped = {
      fetchValue: this.fetchValue,
      observeValue: this.observeValue
        .distinctUntilChanged()
        .map(data => {
          return mapFn(data);
        })
        .distinctUntilChanged(),
      getValue: () => {
        return mapFn(this.getValue());
      },
    };
    mapped.map = map.bind(mapped);
    mapped.expand = expand.bind(mapped);
    mapped.eval = evalDoc.bind(mapped);
    return mapped;
  }

  function evalDoc(lambdaDoc) {
    const evaluatedDoc = {
      fetchValue: async () => {
        await this.fetchValue();
        await lambdaDoc.fetchValue();

        // run once to fill dependencies
        const { dependencies, reComputeResult } = computeLambdaResult(
          this,
          lambdaDoc,
          cloudClient,
          {},
        );

        await Promise.all(
          [...dependencies].map(async dep => {
            await dep.fetchValue();
          }),
        );

        return reComputeResult();
      },
      observeValue: this.observeValue
        .distinctUntilChanged()
        .pipe(filterUndefined())
        .mergeMap(async o => {
          const expandSpec = expandFn(o, this);
          const cloudValues = collectCloudValues(expandSpec);
          await Promise.all(cloudValues.map(v => v.fetchValue()));
          const expanded = doExpansion(expandSpec);
          return expanded;
        })
        .pipe(filterUndefined())
        .distinctUntilChanged(),
      getValue: () => {
        const { result } = computeLambdaResult(
          this,
          lambdaDoc,
          cloudClient,
          {},
        );
        return result;
      },
    };
    evaluatedDoc.map = map.bind(evaluatedDoc);
    evaluatedDoc.expand = expand.bind(evaluatedDoc);
    evaluatedDoc.eval = evalDoc.bind(evaluatedDoc);
    return evaluatedDoc;
  }

  cloudDoc.map = map.bind(cloudDoc);
  cloudDoc.expand = expand.bind(cloudDoc);
  cloudDoc.eval = evalDoc.bind(cloudDoc);

  return cloudDoc;
}
