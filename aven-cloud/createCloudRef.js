import { Observable, BehaviorSubject } from 'rxjs-compat';
import createCloudObject from './createCloudObject';

const observeNull = Observable.create(observer => {
  observer.next(undefined);
});

export default function createCloudRef({ dataSource, name, domain, ...opts }) {
  const objectCache = opts.objectCache || {};

  if (!name) {
    throw new Error('name must be provided to createCloudRef!');
  }
  if (!domain) {
    throw new Error('domain must be provided to createCloudRef!');
  }

  const refState = new BehaviorSubject({
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
  const getState = () => refState.value;

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
    let upstreamSubscription = () => {};
    dataSource.observeRef(domain, name).then(upstreamObs => {
      setState({ isConnected: true });
      upstreamSubscription = upstreamObs.subscribe({
        next: upstreamRef => {
          setState({
            id: upstreamRef.id,
            lastSyncTime: Date.now(),
          });
          observer.next(refState.value);
        },
      });
    });

    return () => {
      setState({ isConnected: false });
      upstreamSubscription.unsubscribe();
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
    const obj = getObject();
    if (!obj) {
      return undefined;
    }
    return obj.getValue();
  }

  async function put(value) {
    const obj = _getObjectWithValue(value);
    await putObject(obj);
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
        `Cannot putObject of "${name}" while another put is in progress!`
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
        `Cannot look up object ID in ${name} on ${lookup.join()}`
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

  return {
    getState,
    name,
    domain,
    fetch,
    put,
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
}
