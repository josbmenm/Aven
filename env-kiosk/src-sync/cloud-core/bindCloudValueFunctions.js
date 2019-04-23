import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import getIdOfValue from '../cloud-utils/getIdOfValue';

function flatArray(a) {
  return [].concat.apply([], a);
}

function filterUndefined() {
  return filter(value => value !== undefined);
}

function expandCloudValue(cloudValue, cloudClient, expandFn) {
  function isCloudValue(o) {
    // if it looks and quacks like a duck..
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
      return null;
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
  const isConnected = new BehaviorSubject(false);
  const getValue = () => {
    const o = cloudValue.getValue();
    const expandSpec = expandFn(o, cloudValue);
    const expanded = doExpansion(expandSpec);
    return expanded;
  };
  const expanded = {
    isConnected,
    getId: () => getIdOfValue(getValue()),
    getIsConnected: isConnected.getValue,
    type: 'ExpandedDoc',
    getFullName: () => {
      return cloudValue.getFullName() + '__expanded';
    },
    get: toGet => {
      throw new Error(
        `Cannot get "${toGet}" on ${cloudValue.getFullName()} because it has been evaluated.`
      );
    },
    fetchValue: async () => {
      await cloudValue.fetchValue();
      const expandSpec = expandFn(cloudValue.getValue(), cloudValue);
      const cloudValues = collectCloudValues(expandSpec);
      await Promise.all(cloudValues.map(v => v.fetchValue()));
    },
    getContext: () => {
      return {
        type: 'ExpandedDoc',
        // todo
      };
    },
    observeValue: cloudValue.observeValue
      .distinctUntilChanged()
      .pipe(filterUndefined())
      .mergeMap(async o => {
        isConnected.next(false);
        const expandSpec = expandFn(o, cloudValue);
        const cloudValues = collectCloudValues(expandSpec);
        await Promise.all(cloudValues.map(v => v.fetchValue()));
        isConnected.next(true);
        const expanded = doExpansion(expandSpec);
        return expanded;
      })
      .pipe(filterUndefined())
      .distinctUntilChanged(),
    observeValueAndId: new Observable(() => {
      throw new Error(
        'sorry, observeValueAndId is not supported for expand right now. Use observeValue or lambda functions instead.'
      );
    }),
    getValue,
  };
  bindCloudValueFunctions(expanded, cloudClient);
  return expanded;
}

function evalCloudValue(cloudValue, cloudClient, evalCache, lambdaDoc) {
  let lambdaCache = evalCache.get(lambdaDoc);
  if (!lambdaCache) {
    lambdaCache = new Map();
    evalCache.set(lambdaDoc, lambdaCache);
  }
  let evaluatedDoc = evalCache.get(cloudValue);
  if (!evaluatedDoc) {
    const isConnected = new BehaviorSubject(false);
    const getValue = () => {
      return lambdaDoc.functionGetValue(cloudValue);
    };
    const handleFnConnectivity = isConn => {
      // effectively, this is the only way for an eval doc to be connected
      isConnected.next(isConn);
    };
    // creating a synthetic doc that can be observed and fetched.
    evaluatedDoc = {
      isConnected,
      getId: () => getIdOfValue(getValue()),
      getIsConnected: isConnected.getValue,
      type: 'EvaluatedDoc',
      getContext: () => {
        return {
          type: 'EvaluatedDoc',
          argument: { type: 'BlockReference', id: cloudValue.getId() },
          lambda: { type: 'LambdaReference', name: lambdaDoc.getFullName() },
        };
      },
      getFullName: () => {
        return cloudValue.getFullName() + '__evalby_' + lambdaDoc.getFullName();
      },
      get: toGet => {
        throw new Error(
          `Cannot get "${toGet}" on ${cloudValue.getFullName()} because it has been evaluated.`
        );
      },
      // the actual loading and computation is performed by the lambda doc, which may refer to the cloud block lambda.
      // the doc function/lambda may have been overridden via setLambda and $setOverrideFunction
      fetchValue: () => lambdaDoc.functionFetchValue(cloudValue),
      observeValue: lambdaDoc.functionObserveValue(
        cloudValue,
        handleFnConnectivity
      ),
      observeValueAndId: lambdaDoc.functionObserveValueAndId(
        cloudValue,
        handleFnConnectivity
      ),
      getValue,
    };
    bindCloudValueFunctions(evaluatedDoc, cloudClient);
    evalCache.set(cloudValue, evaluatedDoc);
  }
  return evaluatedDoc;
}

function mapCloudValue(cloudValue, cloudClient, mapFn) {
  const mapped = {
    isConnected: cloudValue.isConnected,
    getIsConnected: cloudValue.isConnected.getValue,
    type: cloudValue.type + '-Mapped',
    getId: () => getIdOfValue(mapFn(cloudValue.getValue())),
    getFullName: () => {
      return cloudValue.getFullName() + '__mapped';
    },
    getContext: () => {
      return {
        type: 'MappedDoc',
      };
    },
    get: toGet => {
      throw new Error(
        `Cannot get "${toGet}" on ${cloudValue.getFullName()} because it has been mapped.`
      );
    },
    fetchValue: cloudValue.fetchValue,
    observeValue: cloudValue.observeValue.distinctUntilChanged().map(data => {
      return mapFn(data);
    }),
    observeValueAndId: cloudValue.observeValueAndId
      .distinctUntilChanged()
      .map(data => {
        const value = mapFn(data);
        return { value, getId: () => getIdOfValue(value) };
      }),
    // distinctUntilChanged(),
    getValue: () => {
      return mapFn(cloudValue.getValue());
    },
  };

  bindCloudValueFunctions(mapped, cloudClient);
  return mapped;
}

export default function bindCloudValueFunctions(cloudValue, cloudClient) {
  const evalCache = new Map();
  cloudValue.map = (...args) => mapCloudValue(cloudValue, cloudClient, ...args);
  cloudValue.expand = (...args) =>
    expandCloudValue(cloudValue, cloudClient, ...args);
  cloudValue.eval = (...args) =>
    evalCloudValue(cloudValue, cloudClient, evalCache, ...args);
}
