import { Observable, BehaviorSubject, Subject } from "rxjs-compat";
import { tap } from "rxjs";
import createCloudObject from "./createCloudObject";

const observeNull = Observable.create(observer => {});

export default function createCloudRef({ dataSource, name, domain, ...opts }) {
  const objectCache = opts.objectCache || {};

  if (!name) {
    throw new Error("name must be provided to createCloudRef!");
  }
  if (!domain) {
    throw new Error("domain must be provided to createCloudRef!");
  }

  const refState = new BehaviorSubject({
    id: null,
    isConnected: false,
    lastSyncTime: null
  });

  const setState = newState => {
    refState.next({
      ...refState.value,
      ...newState
    });
  };
  const getState = () => refState.value;

  // let _isWatching = false;
  // let _state = {
  //   name,

  //   // sync state:
  //   lastFetchedTime: null,
  //   puttingFromObjectId: null,

  //   // obj data:
  //   objectId: null
  // };

  async function fetch() {
    const result = await dataSource.dispatch({
      type: "GetRef",
      domain,
      name
    });
    refState.next({
      ...refState.value,
      id: result.id,
      lastSyncTime: Date.now()
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
            lastSyncTime: Date.now()
          });
          observer.next(refState.value);
        }
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
    const o = (objectCache[id] = createCloudObject({ dataSource, domain, id }));
    return o;
  }

  function _getObjectWithValue(value) {
    const obj = createCloudObject({ dataSource, domain, value });

    if (objectCache[obj.id]) {
      return objectCache[obj.id];
    }
    return (objectCache[obj.id] = obj);
  }

  function getObject() {
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
      type: "PutRef",
      domain,
      name,
      id: objId
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
      puttingFromId: state.id
    });
    try {
      await obj.put();
      await putId(obj.id);

      setState({
        puttingFromId: null,
        lastPutTime: Date.now()
      });
    } catch (e) {
      setState({
        puttingFromId: null,
        id: lastId
      });
      console.error(e);
      throw new Error(`Failed to putObjectId "${obj.id}" to "${name}"!`);
    }
  }

  // async function fetchObject() {
  //   // todo, avoid fetch if this._isWatching and client is connected
  //   await this.fetch();
  //   const obj = this.getObject();
  //   if (!obj) {
  //     return;
  //   }
  //   await obj.fetch();
  // }

  // let _updateObserved = null;
  // let _notifyObserved = () => {
  //   this._updateObserved && this._updateObserved();
  // };

  // putObjectId = async objectId => {
  //   if (this._state.puttingFromObjectId) {
  //     throw new Error(
  //       `Cannot putObjectId of "${
  //         this._name
  //       }" while another put is in progress!`
  //     );
  //   }
  //   const fromObjectId = this._state.objectId;
  //   try {
  //     this._state.puttingFromObjectId = fromObjectId;
  //     this._state.objectId = objectId;
  //     await this._client.dispatch({
  //       type: "putRef",
  //       domain: this._client.getDomain(),
  //       objectId,
  //       ref: this._name
  //     });
  //     this._state.puttingFromObjectId = null;
  //     this._notifyObserved();
  //   } catch (e) {
  //     this._state.puttingFromObjectId = null;
  //     this._state.objectId = fromObjectId;
  //     this._notifyObserved();
  //     console.error(e);
  //     throw new Error(`Failed to putObjectId of "${this._name}"!`);
  //   }
  // };

  // putObject = async obj => {
  //   const objectId = obj.getObjectId();
  //   if (this._state.puttingFromObjectId) {
  //     throw new Error(
  //       `Cannot putObjectId of "${
  //         this._name
  //       }" while another put is in progress!`
  //     );
  //   }
  //   const fromObjectId = this._state.objectId;
  //   try {
  //     this._state.puttingFromObjectId = fromObjectId;
  //     this._state.objectId = objectId;
  //     this._notifyObserved();
  //     await obj.put();
  //     await this._client.dispatch({
  //       type: "putRef",
  //       domain: this._client.getDomain(),
  //       objectId,
  //       ref: this._name
  //     });
  //     this._state.puttingFromObjectId = null;
  //     this._notifyObserved();
  //   } catch (e) {
  //     this._state.puttingFromObjectId = null;
  //     this._state.objectId = fromObjectId;
  //     this._notifyObserved();
  //     console.error(e);
  //     throw new Error(`Failed to putObjectId of "${this._name}"!`);
  //   }
  // };

  // $handleRefEvent = evt => {
  //   if (evt.objectId === this._state.objectId) {
  //     return;
  //   }
  //   if (this._state.puttingFromObjectId) {
  //     console.error("remote event while putting!", {
  //       remoteId: evt.objectId,
  //       localNewId: this._state.objectId,
  //       localLastId: this._state.puttingFromObjectId
  //     });
  //     // this probably means a conflict is happening
  //   }
  //   this._state.objectId = evt.objectId;
  //   this._notifyObserved();
  // };

  // observe = Observable.create(observer => {
  //   observer.next(this._state);
  //   this.fetch()
  //     .then(() => {
  //       observer.next(this._state);
  //     })
  //     .catch(e => {
  //       observer.next(this._state);
  //       console.error("Could not fetch ref " + this._name);
  //       console.error(e);
  //     });
  //   if (this._updateObserved) {
  //     throw new Error(
  //       `Cannot observe "${
  //         this._name
  //       }" because it already is being observed internally, and the observable should be .share()'d!`
  //     );
  //   }
  //   this._updateObserved = () => {
  //     observer.next(this._state);
  //   };
  //   this._client.subscribeUpstreamRef(this);
  //   this._isWatching = true;
  //   console.log(`👓 Watching "${this._name}"`);
  //   const detach = () => {
  //     console.log(`✋ Done watching "${this._name}"`);
  //     this._isWatching = false;
  //     this._updateObserved = null;
  //   };
  //   return detach;
  // }).share();

  // write = async transactionFn => {
  //   await this.fetchObject();
  //   const prevObjectVal = this.getObjectValue();
  //   const nextVal = transactionFn(prevObjectVal);
  //   const nextObj = this._client.createObject(nextVal);
  //   await this.putObject(nextObj);
  // };

  // function getObject() {
  //   if (!this._state.objectId) {
  //     return null;
  //   }
  //   return this._client.getObject(this._state.objectId);
  // }

  // function getObjectValue() {
  //   const obj = this.getObject();
  //   if (!obj) {
  //     return null;
  //   }
  //   return obj.getValue();
  // }

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
    if (typeof refVal !== "string") {
      throw new Error(
        `Cannot look up object ID in ${name} on ${location.join()}`
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

  // return {
  //   domain,
  //   name,
  //   getObject,
  //   getObjectValue,
  //   write,
  //   observe,
  //   putObject,
  //   putObjectId,
  //   fetch,
  //   fetchObject,
  //   observe,
  //   observeValue,
  //   observeConnectedObjectValue
  // };
  return {
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
    observeValue,
    observe,
    write,
    observeConnectedValue
  };
}
