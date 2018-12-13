import { Observable, BehaviorSubject } from 'rxjs-compat';
import createCloudObject from './createCloudObject';
import uuid from 'uuid/v1';
const pathJoin = require('path').join;

const observeNull = Observable.create(observer => {
  observer.next(undefined);
});
const observeStatic = val =>
  Observable.create(observer => {
    observer.next(val);
  });

const POSTING_REF_NAME = Symbol('POSTING_REF_NAME');

export default function createCloudRef({
  dataSource,
  name,
  domain,
  onRef,
  parent,
  ...opts
}) {
  const objectCache = opts.objectCache || {};

  if (!name) {
    throw new Error('name must be provided to createCloudRef!');
  }
  if (!domain) {
    throw new Error('domain must be provided to createCloudRef!');
  }

  const refState = new BehaviorSubject({
    name,
    id: null,
    isConnected: false,
    lastSyncTime: null,
    isDestroyed: false,
  });

  const setState = newState => {
    refState.next({
      ...refState.value,
      ...newState,
    });
  };

  function getState() {
    return refState.value;
  }

  function getName() {
    return refState.value.name;
  }

  async function fetch() {
    const result = await dataSource.dispatch({
      type: 'GetRef',
      domain,
      name,
    });
    if (result) {
      refState.next({
        ...refState.value,
        id: result.id,
        lastSyncTime: Date.now(),
      });
    }
  }

  async function destroy() {
    setState({ isConnected: false, id: null, isDestroyed: true });
    await dataSource.dispatch({
      type: 'DestroyRef',
      domain,
      name,
    });
  }

  async function fetchValue() {
    await fetch();
    const obj = getObject();
    if (obj) {
      await obj.fetch();
    }
  }
  const observe = Observable.create(observer => {
    let upstreamSubscription = null;
    dataSource.observeRef(domain, name).then(upstreamObs => {
      setState({ isConnected: true });
      upstreamSubscription = upstreamObs.subscribe({
        next: upstreamRef => {
          setState({
            id: upstreamRef.id,
            lastSyncTime: Date.now(),
            value: upstreamRef.value,
          });
          observer.next(refState.value);
        },
      });
    });

    return () => {
      setState({ isConnected: false });
      upstreamSubscription && upstreamSubscription.unsubscribe();
    };
  })
    .multicast(() => new BehaviorSubject(refState.value))
    .refCount();

  function _getObjectWithId(id) {
    if (objectCache[id]) {
      return objectCache[id];
    }
    const o = (objectCache[id] = createCloudObject({
      dataSource,
      domain,
      id,
      name,
    }));
    return o;
  }

  function _getObjectWithValue(value) {
    const obj = createCloudObject({ dataSource, domain, value, name });

    if (objectCache[obj.id]) {
      return objectCache[obj.id];
    }
    return (objectCache[obj.id] = obj);
  }

  function getObject(requestedId) {
    if (requestedId) {
      return _getObjectWithId(requestedId);
    }
    const { id } = refState.value;
    if (!id) {
      return undefined;
    }
    return _getObjectWithId(id);
  }

  function getValue() {
    const { id, value } = refState.value;
    if (value) {
      return value;
    }
    if (!id) {
      return undefined;
    }
    const obj = _getObjectWithId(id);
    return obj.getValue();
  }

  async function put(value) {
    const obj = _getObjectWithValue(value);
    await putObject(obj);
  }

  async function post() {
    const id = uuid();
    const fullName = pathJoin(name, id);
    return onRef(fullName);
  }

  function get(subRefName) {
    const fullName = pathJoin(name, subRefName);
    return onRef(fullName);
  }

  async function putId(objId) {
    await dataSource.dispatch({
      type: 'PutRef',
      domain,
      name,
      id: objId,
    });
  }

  async function write(value) {
    const obj = _getObjectWithValue(value);
    await obj.put();
    return { id: obj.id };
  }

  async function putObject(obj) {
    const state = getState();
    if (state.puttingFromObjectId) {
      throw new Error(
        `Cannot putObject of "${name}" while another put is in progress!`,
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
      throw new Error(`Failed to putObjectId "${obj.id}" to "${name}"!`);
    }
  }

  const observeValue = observe
    .map(r => {
      if (r.value !== undefined) {
        return observeStatic(r.value);
      }
      if (!r.id) {
        return observeNull;
      }
      const obj = _getObjectWithId(r.id);
      return obj.observeValue;
    })
    .switch();

  function lookupRefObject(inputVal, lookup) {
    let refVal = inputVal;
    lookup.forEach(v => {
      refVal = refVal && refVal[v];
    });
    if (refVal == null) {
      return observeNull;
    }
    if (typeof refVal !== 'string') {
      throw new Error(
        `Cannot look up object ID in ${name} on ${lookup.join()}`,
      );
    }
    const connectedObj = _getObjectWithId(refVal);
    return connectedObj;
  }
  function observeConnectedValue(lookup) {
    return observeValue
      .map(value => {
        if (!value) {
          return observeNull;
        }
        const connected = lookupRefObject(value, lookup);
        return connected.observeValue;
      })
      .switch();
  }

  async function fetchConnectedValue(lookup) {
    await fetchValue();
    const connected = lookupRefObject(getValue(), lookup);
    if (connected) {
      await connected.fetch();
    }
  }

  async function getConnectedValue(lookup) {
    const obj = getObject();
    const connected = lookupRefObject(obj.value, lookup);
    if (connected) {
      return connected.getValue();
    }
  }

  async function transact(transactionFn) {
    await fetchValue();
    const newValue = transactionFn(getValue());
    await put(newValue);
  }

  const r = {
    get,
    getState,
    getName,
    domain,
    fetch,
    put,
    post,
    putId,
    putObject,
    fetchValue,
    fetchConnectedValue,
    getConnectedValue,
    getObject,
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
        typeof o === 'object' &&
        typeof o.observeValue === 'object' &&
        typeof o.observeValue.subscribe === 'function' &&
        typeof o.fetchValue === 'function' &&
        typeof o.getValue === 'function'
      );
    }
    function doExpansion(o) {
      if (isCloudValue(o)) {
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
      if (isCloudValue(o)) {
        return [o];
      } else if (o instanceof Array) {
        return flatArray(o.map(collectCloudValues));
      } else if (typeof o === 'object') {
        return flatArray(Object.values(o).map(collectCloudValues));
      }
      return [];
    }
    return {
      ...r,
      fetchValue: async () => {
        await r.fetchValue();
        const expanded = expandFn(r.getValue(), r);
        const cloudValues = collectCloudValues(expanded);
        await Promise.all(cloudValues.map(v => v.fetchValue()));
      },
      observeValue: r.observeValue.switchMap(o => {
        // const cloudValues = collectCloudValues(o);
        throw new Error('not ready yet! :-(');
        // return {};
      }),
      getValue: () => {
        const o = r.getValue();
        const expandSpec = expandFn(o, r);
        const expanded = doExpansion(expandSpec);
        return expanded;
      },
    };
  }
  r.expand = expand;

  function map(mapFn) {
    return {
      ...r,
      map: innerMapFn => r.map(v => innerMapFn(mapFn(v))),
      observeValue: r.observeValue.map(mapFn),
      getValue: () => {
        return mapFn(r.getValue());
      },
    };
  }
  r.map = map;

  return r;
}
