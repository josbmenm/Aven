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

export function createDocPool({
  blockCache,
  domain,
  dataSource,
  onGetParentName,
}) {
  const _docs = {};

  function get(name) {
    const localName = name.split('/')[0];
    let restOfName = null;
    if (localName.length < name.length - 1) {
      restOfName = name.slice(localName.length + 1);
    }
    if (!_docs[localName]) {
      _docs[localName] = createCloudDoc({
        dataSource,
        domain,
        name: localName,
        blockCache: blockCache,
        onRename: newName => {
          console.log('wow rename', newName, localName, onGetParentName());
          return move(localName, newName);
        },
        onGetParentName,
      });
    }
    if (restOfName) {
      return _docs[localName].get(restOfName);
    }
    return _docs[localName];
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
    console.log('posting under', onGetParentName(), localName);
    const postedDoc = createCloudDoc({
      dataSource,
      domain,
      name: localName,
      blockCache: blockCache,
      onGetParentName,
      onRename: newName => move(localName, newName),
      isUnposted: true,
    });
    console.log('assigning posted doc ' + localName);
    _docs[localName] = postedDoc;
    return postedDoc;
  }

  return { get, move, post };
}

export default function createCloudDoc({
  dataSource,
  name,
  domain,
  onGetParentName,
  isUnposted,
  onRename,
  ...opts
}) {
  const blockCache = opts.blockCache || {};

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
  });

  async function fetch() {
    const result = await dataSource.dispatch({
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
    await dataSource.dispatch({
      type: 'DestroyDoc',
      domain,
      name: getFullName(),
    });
  }

  async function fetchValue() {
    await fetch();
    const block = getBlock();
    if (block) {
      await block.fetch();
    }
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

  function getBlock(requestedId) {
    if (requestedId) {
      return _getBlockWithId(requestedId);
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

  const cloudDoc = {
    $setName,
    get: docs.get,
    post: docs.post,
    getState,
    getName,
    getFullName,
    domain,
    fetch,
    put,
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
    return mapped;
  }
  cloudDoc.map = map.bind(cloudDoc);
  cloudDoc.expand = expand.bind(cloudDoc);

  return cloudDoc;
}
