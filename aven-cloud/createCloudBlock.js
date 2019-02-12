import { Observable, BehaviorSubject } from 'rxjs-compat';
import SHA1 from 'crypto-js/sha1';
import bindCloudValueFunctions from './bindCloudValueFunctions';

const JSONStringify = require('json-stable-stringify');

export default function createCloudBlock({
  domain,
  onGetName,
  dispatch,
  id,
  value,
  lastFetchTime, // should be set if this block came from the server..
  cloudClient,
  blockValueCache,
}) {
  let observedBlockId = null;

  blockValueCache = blockValueCache || {}; // reassigning an argument is clumsy but convenient here

  if (value !== undefined) {
    const valueString = JSONStringify(value);
    observedBlockId = SHA1(valueString).toString();
    blockValueCache[observedBlockId] = value;
  }
  const blockId = id || observedBlockId;
  if (!blockId) {
    throw new Error('Block id could not be determined!');
  }
  if (id && observedBlockId && id !== observedBlockId) {
    throw new Error(
      'id and value were both provided to createCloudBlock, but the id does not match the value!'
    );
  }

  if (!blockId) {
    throw new Error('id or value must be provided to createCloudBlock!');
  }

  value = blockValueCache[blockId];

  const blockState = new BehaviorSubject({
    // sync state:
    isConnected: value !== undefined,
    lastPutTime: null,
    lastFetchTime: lastFetchTime || null,

    // block data:
    value,
  });

  function getReference() {
    if (!blockId) {
      throw new Error(
        'Cannot getReference of an incomplete block without a value or id'
      );
    }
    return { type: 'BlockReference', id: blockId };
  }

  function serialize() {
    const value = getState().value;
    if (value == null) {
      throw new Error('Cannot serialize a block without a value');
    }
    return { value, id: blockId };
  }

  const observe = Observable.create(observer => {
    fetch()
      .then(() => {})
      .catch(console.error); // todo improve async error handling, set err state, etc..
    const upstreamSubscription = blockState.subscribe({
      next: val => {
        observer.next(val);
      },
    });
    return () => {
      upstreamSubscription.unsubscribe();
    };
  })
    .multicast(() => new BehaviorSubject(blockState.value))
    .refCount();

  function setState(newState) {
    blockState.next({
      ...blockState.value,
      ...newState,
    });
  }
  function getState() {
    return blockState.value;
  }
  function isPublished() {
    return !!blockState.value.lastPutTime || !!blockState.value.lastFetchTime;
  }
  function setPutTime() {
    setState({
      lastPutTime: Date.now(),
    });
  }
  function getValue() {
    let val = getState().value;
    if (val === undefined && blockValueCache[blockId] !== undefined) {
      setState({ value: blockValueCache[blockId] });
      return blockValueCache[blockId];
    } else {
      return val;
    }
  }

  function getBlock() {
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
    if (getValue() !== undefined) {
      return;
    }
    const result = await dispatch({
      type: 'GetBlock',
      id,
      domain,
      name: onGetName(),
    });
    if (!result || result.value === undefined) {
      throw new Error(`Error fetching block "${id}" from remote!`);
    }
    setState({
      value: result.value,
      lastFetchTime: Date.now(),
    });
  }

  async function fetchValue() {
    await fetch();
  }

  const cloudBlock = {
    getFullName: () => onGetName(),
    getId: () => blockId,
    id: blockId,
    get: () => {
      throw new Error('Cannot "get" on a block');
    },
    isPublished,
    setPutTime,
    getValue,
    fetch,
    fetchValue,
    getBlock,
    observe,
    observeValue,
    getReference,
    serialize,
  };

  bindCloudValueFunctions(cloudBlock, cloudClient);

  return cloudBlock;
}
