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
        onRename: newName => move(localName, newName),
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
    _docs[toName] = _docs[fromName];
    _docs[toName].$setName(toName);
    delete _docs[fromName];
  }

  function post() {
    const localName = uuid();
    _docs[localName] = createCloudDoc({
      dataSource,
      domain,
      name: localName,
      blockCache: blockCache,
      onGetParentName,
      onRename: newName => move(localName, newName),
      isUnposted: true,
    });
    return _docs[localName];
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

  async function ensurePosted(obj) {
    if (docState.value.isPosted) {
      return null;
    }
    const parent = onGetParentName();
    const puttingFromId = r.id;
    setState({
      id: obj.id,
      puttingFromId,
    });
    if (!postingInProgress) {
      let postData = { id: null };
      if (obj && obj.getValue()) {
        postData = { value: obj.getValue() };
      } else if (obj) {
        postData = { id: obj.id };
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
      if (obj.id === result.id) {
        return obj;
      }
      return null; // probably this is not an error because there may have been race conditions with multiple calls to ensurePosted
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
    const obj = getBlock();
    if (obj) {
      await obj.fetch();
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
    const obj = createCloudBlock({
      onNamedDispatch: _namedDispatch,
      value,
    });

    if (blockCache[obj.id]) {
      return blockCache[obj.id];
    }
    return (blockCache[obj.id] = obj);
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
    const obj = _getBlockWithId(id);
    return obj.getValue();
  }

  async function put(value) {
    const obj = _getBlockWithValue(value);
    await putBlock(obj);
  }

  async function putId(objId) {
    await dataSource.dispatch({
      type: 'PutDoc',
      domain,
      name: getFullName(),
      id: objId,
    });
  }

  async function write(value) {
    await ensurePosted();
    const obj = _getBlockWithValue(value);
    await obj.put();
    return { id: obj.id };
  }

  async function putBlock(obj) {
    const postResult = await ensurePosted(obj);
    if (postResult === obj) {
      return;
    }

    const state = getState();
    if (state.puttingFromId) {
      throw new Error(
        `Cannot putBlock of "${name}" while another put is in progress!`
      );
    }
    const lastId = state.id;
    setState({
      id: obj.id,
      puttingFromId: state.id,
    });
    try {
      await obj.put();
      await putId(obj.id);

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
      throw new Error(`Failed to putBlockId "${obj.id}" to "${name}"!`);
    }
  }

  const observeValue = observe
    .map(rr => {
      if (rr.value !== undefined) {
        return observeStatic(rr.value);
      }
      if (!rr.id) {
        return observeNull;
      }
      const obj = _getBlockWithId(rr.id);
      return obj.observeValue;
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
    const connectedObj = _getBlockWithId(docValue);
    return connectedObj;
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
    const obj = getBlock();
    const connected = lookupDocBlock(obj.value, lookup);
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

  const r = {
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
    putBlock,
    fetchValue,
    fetchConnectedValue,
    getConnectedValue,
    getBlock,
    getValue,
    observeValue,
    observe,
    write,
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
        const expandSpec = expandFn(o, r);
        const expanded = doExpansion(expandSpec);
        return expanded;
      },
    };
    expanded.map = map.bind(expanded);
    expanded.expand = expand.bind(expanded);
    return expanded;
  }
  r.expand = expand;

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
  r.map = map.bind(r);
  r.expand = expand.bind(r);

  return r;
}
