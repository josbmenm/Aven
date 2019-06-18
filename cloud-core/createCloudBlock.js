import { Observable, BehaviorSubject } from 'rxjs-compat';
import SHA256 from 'crypto-js/sha256';
import bindCloudValueFunctions from './bindCloudValueFunctions';
import mapBehaviorSubject from '../utils/mapBehaviorSubject';
import runLambda from './runLambda';
import getIdOfValue from '../cloud-utils/getIdOfValue';
import Err from '../utils/Err';

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
    observedBlockId = SHA256(valueString).toString();
    blockValueCache[observedBlockId] = value;
  }
  const blockId = id || observedBlockId;
  if (!blockId && value === undefined) {
    throw new Error('Cannot create block without id or value!');
  }
  if (!blockId) {
    throw new Error('Block id could not be determined!');
  }
  if (id && observedBlockId && id !== observedBlockId) {
    throw new Error(
      'id and value were both provided to createCloudBlock, but the id does not match the value!',
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
        'Cannot getReference of an incomplete block without a value or id',
      );
    }
    return { type: 'BlockReference', id: blockId };
  }

  function serialize() {
    const value = getState().value;
    if (value == null) {
      return null;
    }
    return { value, id: blockId };
  }

  const observe = Observable.create(observer => {
    const upstreamSubscription = blockState.subscribe({
      next: val => {
        observer.next(val);
      },
    });
    fetch()
      .then(() => {})
      .catch(console.error); // todo improve async error handling, set err state, etc..
    return () => {
      upstreamSubscription && upstreamSubscription.unsubscribe();
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

  async function put() {
    if (blockState.value.lastFetchTime || blockState.value.lastPutTime) {
      return;
    }
    if (blockState.value.value === undefined) {
      throw new Err('Cannot put empty block');
    }
    const name = onGetName();
    const resp = await dispatch({
      type: 'PutBlock',
      domain,
      name,
      value: blockState.value.value,
    });
    if (resp.id !== blockId) {
      throw new Error(
        `Attempted to put "${name}" block "${blockId}" but the server claims the ID is "${
          resp.id
        }"`,
      );
    }
    setPutTime();
  }

  const observeValue = observe
    .map(state => {
      return state.value;
    })
    .filter(val => {
      return val !== undefined;
    });

  const observeValueAndId = observe
    .map(state => {
      return { value: state.value, getId: () => blockId };
    })
    .filter(({ value }) => {
      return value !== undefined;
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
      const docName = onGetName();
      const result = await dispatch({
        type: 'GetBlock',
        id: blockId,
        domain,
        name: docName,
      });
      if (!result || result.value === undefined) {
        throw new Error(
          `Error fetching block "${id}" of "${docName}" from remote!`,
        );
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

  async function loadValue() {
    await fetch();
    return getValue();
  }

  const isConnected = mapBehaviorSubject(
    blockState,
    state => state.isConnected,
  );

  let _evaluatedFunction = null;

  function runEvalLambda(lambdaValue, argValue, argId, argDoc) {
    // careful! Only run this once lambdaValue (this block's value) is known, because the result of the eval will be cached and the fn will never change. This should be fine because we are in an immutable block.

    if (!_evaluatedFunction) {
      if (!lambdaValue || lambdaValue.type !== 'LambdaFunction') {
        throw new Error(
          'Cannot eval this block because it is not loaded or is not of type "LambdaFunction"',
        );
      }
      _evaluatedFunction = eval(lambdaValue.code);
    }
    return runLambda(_evaluatedFunction, argValue, argId, argDoc, cloudClient);
  }

  function functionGetValue(argDoc) {
    const { result } = runEvalLambda(
      getValue(),
      argDoc && argDoc.getValue(),
      argDoc && argDoc.getId(),
      argDoc,
    );

    return result;
  }

  const functionFetchValue = async argumentValue => {
    await argumentValue.fetchValue();
    await fetch();
    const { loadDependencies, reComputeResult } = runEvalLambda(
      getValue(),
      argumentValue.getValue(),
      argumentValue.getId(),
      argumentValue,
    );
    await loadDependencies();
    return reComputeResult();
  };

  const functionObserveValueAndId = (argumentDoc, onIsConnected) => {
    return observeValue.switchMap(fnValue => {
      if (fnValue === undefined) {
        return Observable.of(null);
      }
      return argumentDoc.observeValueAndId
        .filter(({ value }) => value !== undefined)
        .flatMap(async ({ getId, value }) => {
          const argumentId = getId();
          const {
            reComputeResult,
            loadDependencies,
            getIsConnected,
          } = runEvalLambda(fnValue, value, argumentId, argumentDoc);
          onIsConnected(getIsConnected());
          await loadDependencies();
          onIsConnected(getIsConnected());
          const result = reComputeResult();
          return {
            value: result,
            getId: () => getIdOfValue(result),
            context: {
              type: 'LambdaResult',
              lambda: {
                type: 'LambdaReference',
                name: onGetName(),
                id: blockId,
              },
              argument: argumentId && {
                type: 'BlockReference',
                id: argumentId,
              },
            },
          };
        });
    });
  };

  const cloudBlock = {
    type: 'Block',
    isConnected,
    getIsConnected: () => isConnected.getValue(),
    getFullName: () => onGetName(),
    getId: () => blockId,
    id: blockId,
    get: () => {
      throw new Error('Cannot "get" on a block');
    },
    put,
    getIsPublished,
    setPutTime, // deprecate me!
    getValue,
    fetch,
    loadValue,
    getState,
    observe,
    observeValue,
    observeValueAndId,
    getReference,
    serialize,

    functionGetValue,
    functionFetchValue,
    functionObserveValueAndId,
  };

  bindCloudValueFunctions(cloudBlock, cloudClient);

  return cloudBlock;
}
