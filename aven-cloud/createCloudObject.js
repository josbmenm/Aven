import { Observable, BehaviorSubject } from 'rxjs-compat';
import SHA1 from 'crypto-js/sha1';

const JSONStringify = require('json-stable-stringify');

export default function createCloudObject({ onNamedDispatch, id, value }) {
  let objectId = false;
  if (value !== undefined) {
    const valueString = JSONStringify(value);
    objectId = SHA1(valueString).toString();
  } else {
    objectId = id;
  }
  if (id && objectId && id !== objectId) {
    throw new Error(
      'id and value were both provided to createCloudObject, but the ID does not match the value!'
    );
  }

  if (!onNamedDispatch) {
    throw new Error('onNamedDispatch be provided to createCloudObject!');
  }
  if (!objectId) {
    throw new Error('id or value must be provided to createCloudObject!');
  }

  const objState = new BehaviorSubject({
    // sync state:
    isConnected: value !== undefined,
    lastPutTime: null,
    lastFetchTime: null,

    // obj data:
    value,
  });

  const observe = Observable.create(observer => {
    fetch()
      .then(() => {})
      .catch(console.error); // todo improve async error handling, set err state, etc..
    const upstreamSubscription = objState.subscribe({
      next: val => {
        observer.next(val);
      },
    });
    return () => {
      upstreamSubscription.unsubscribe();
    };
  })
    .multicast(() => new BehaviorSubject(objState.value))
    .refCount();

  function setState(newState) {
    objState.next({
      ...objState.value,
      ...newState,
    });
  }
  function getState() {
    return objState.value;
  }

  function getValue() {
    return getState().value;
  }

  function getObject() {
    return getState();
  }

  const observeValue = observe
    .map(state => {
      return state.value;
    })
    .filter(val => {
      return val !== undefined;
    });

  async function fetch() {
    if (getState().value !== undefined) {
      return;
    }
    const result = await onNamedDispatch({
      type: 'GetObject',
      id,
    });
    if (!result || result.value === undefined) {
      throw new Error(`Error fetching object "${id}" from remote!`);
    }
    setState({
      value: result.value,
      lastFetchTime: Date.now(),
    });
  }

  async function fetchValue() {
    await fetch();
  }

  async function put() {
    if (getState().value === undefined) {
      throw new Error(`Cannot put empty value from object "${objectId}"!`);
    }
    const res = await onNamedDispatch({
      type: 'PutObject',
      value: getState().value,
    });
    setState({
      lastPutTime: Date.now(),
    });
    if (res.id !== objectId) {
      // if we get here, we are truly screwed!
      throw new Error(
        `Server and client objectIds do not match! Server: ${
          res.id
        }, Client: ${objectId}`
      );
    }
    return res;
  }

  // function getValue() {
  //   return this._state.value;
  // }

  // return {
  //   fetch,
  //   put,
  //   observe,
  //   getValue,
  //   objectId,
  //   domain,
  //   observeValue,
  //   observeConnectedValue
  // };
  return {
    id: objectId,
    put,
    getValue,
    fetch,
    fetchValue,
    getObject,
    observe,
    observeValue,
  };
}
