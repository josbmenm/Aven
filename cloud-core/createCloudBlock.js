import { Observable, BehaviorSubject } from 'rxjs-compat';
import SHA1 from 'crypto-js/sha1';
import bindCloudValueFunctions from './bindCloudValueFunctions';
import mapBehaviorSubject from '../utils/mapBehaviorSubject';

const JSONStringify = require('json-stable-stringify');

export default function createCloudBlock({
  domain,
  onGetName,
  dispatch,
  id,
  value,
  lastFetchTime, // should be set if this block came from the server..
  cloudClient,
  cloudDoc,
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
    return blockState.getValue();
  }
  function getIsPublished() {
    return !!getState().lastPutTime || !!getState().lastFetchTime;
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

  const observeValue = observe
    .map(state => {
      return state.value;
    })
    .filter(val => {
      return val !== undefined;
    });

  let fetchInProgress = null;
  async function fetch() {
    if (getValue() !== undefined) {
      return;
    }
    if (fetchInProgress) {
      // There is only one chunk of remote data. If we are currently fetching on behalf of a previous request, we should just wait for it to finish, rather than starting another simultaneous request
      return await fetchInProgress;
    }
    fetchInProgress = (async () => {
      const result = await dispatch({
        type: 'GetBlock',
        id,
        domain,
        name: onGetName(),
      });
      if (!result || result.value === undefined) {
        throw new Error(`Error fetching block "${id}" from remote!`);
      }
      fetchInProgress = null;
      setState({
        value: result.value,
        lastFetchTime: Date.now(),
        isConnected: true,
      });
    })();
    return await fetchInProgress;
  }

  async function fetchValue() {
    await fetch();
  }

  const isConnected = mapBehaviorSubject(
    blockState,
    state => state.isConnected
  );

  const _functionDependencies = new Set();
  function useValue(cloudValue) {
    _functionDependencies.add(cloudValue);
    return cloudValue.getValue();
  }
  let _evaluatedFunction = null;

  function doTheCompute(lambdaValue, argValue, argDoc) {
    if (!_evaluatedFunction) {
      if (!lambdaValue || lambdaValue.type !== 'LambdaFunction') {
        return null;
      }

      _evaluatedFunction = eval(lambdaValue.code);
    }
    function computeResult() {
      return _evaluatedFunction(argValue, argDoc, cloudClient, useValue);
    }
    async function loadDependencies() {
      await Promise.all(
        [..._functionDependencies].map(async dep => {
          await dep.fetchValue();
        })
      );
    }
    return {
      result: computeResult(),
      loadDependencies,
      reComputeResult: computeResult,
    };
  }

  function functionGetValue(argDoc) {
    const { result } = doTheCompute(getValue(), argDoc.getValue(), argDoc);

    return result;
  }

  const functionFetchValue = async argumentValue => {
    await argumentValue.fetchValue();
    await fetch();
    const { loadDependencies, reComputeResult } = doTheCompute(
      getValue(),
      argumentValue.getValue(),
      argumentValue
    );
    await loadDependencies();
    return reComputeResult();
  };

  const functionObserveValue = argumentValue => {
    return observeValue.switchMap(fnValue => {
      if (fnValue === undefined) {
        return Observable.of(null);
      }
      return argumentValue.observeValue.flatMap(async argValue => {
        const { reComputeResult, loadDependencies } = doTheCompute(
          fnValue,
          argValue,
          argumentValue
        );
        await loadDependencies();
        return reComputeResult();
      });
    });
  };

  const cloudBlock = {
    type: 'Block',
    isConnected,
    getIsConnected: isConnected.getValue,
    getFullName: () => onGetName(),
    getId: () => blockId,
    id: blockId,
    get: () => {
      throw new Error('Cannot "get" on a block');
    },
    getIsPublished,
    setPutTime, // deprecate me!
    getValue,
    fetch,
    fetchValue,
    getState,
    observe,
    observeValue,
    getReference,
    serialize,

    functionGetValue,
    functionFetchValue,
    functionObserveValue,
  };

  bindCloudValueFunctions(cloudBlock, cloudClient);

  return cloudBlock;
}
