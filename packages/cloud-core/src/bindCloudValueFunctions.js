import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import {getIdOfValue} from '@aven-cloud/cloud-utils';

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
      typeof o.loadValue === 'function'
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
    getId: () => getIdOfValue(getValue()).id,
    getIsConnected: isConnected.getValue,
    type: 'ExpandedDoc',
    getFullName: () => {
      return cloudValue.getFullName() + '__expanded';
    },
    get: toGet => {
      throw new Error(
        `Cannot get "${toGet}" on ${cloudValue.getFullName()} because it has been evaluated.`,
      );
    },
    getReference: () => {
      return {
        type: 'ExpandedDoc',
        from: cloudValue.getReference(),
      };
    },
    observeValueAndId: cloudValue.observeValue
      .distinctUntilChanged()
      .pipe(filterUndefined())
      .mergeMap(async o => {
        isConnected.next(false);
        const expandSpec = expandFn(o, cloudValue);
        const cloudValues = collectCloudValues(expandSpec);
        await Promise.all(cloudValues.map(v => v.loadValue()));
        isConnected.next(true);
        const expandedValue = doExpansion(expandSpec);
        return {
          value: expandedValue,
          getId: () => getIdOfValue(expandedValue).id,
        };
      })
      .distinctUntilChanged()
      .shareReplay(),
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
  const cachedResult = lambdaCache.get(cloudValue);
  if (cachedResult) {
    return cachedResult;
  }
  const isConnected = new BehaviorSubject(false);
  const getValue = () => {
    return lambdaDoc.functionGetValue(cloudValue);
  };
  const handleFnConnectivity = isConn => {
    // effectively, this is the only way for an eval doc to be connected
    isConnected.next(isConn);
  };
  // creating a synthetic doc that can be observed and fetched.
  const evalDoc = {
    isConnected,
    getId: () => getIdOfValue(getValue()).id,
    getIsConnected: isConnected.getValue,
    type: 'EvaluatedDoc',
    getReference: () => {
      return {
        type: 'EvaluatedDoc',
        argument: cloudValue.getReference(),
        lambda: lambdaDoc.getReference(),
      };
    },
    getFullName: () => {
      return cloudValue.getFullName() + '__evalby_' + lambdaDoc.getFullName();
    },
    get: toGet => {
      throw new Error(
        `Cannot get "${toGet}" on ${cloudValue.getFullName()} because it has been evaluated.`,
      );
    },
    observeValueAndId: lambdaDoc.functionObserveValueAndId(
      cloudValue,
      handleFnConnectivity,
      value => {
        // err.. cache it?
      },
    ),
    getValue,
  };
  bindCloudValueFunctions(evalDoc, cloudClient);
  lambdaCache.set(cloudValue, evalDoc);
  return evalDoc;
}

function mapCloudValue(cloudValue, cloudClient, mapFn) {
  const mapped = {
    isConnected: cloudValue.isConnected,
    getIsConnected: cloudValue.isConnected.getValue,
    type: cloudValue.type + '-Mapped',
    getId: () => getIdOfValue(mapFn(cloudValue.getValue())).id,
    getFullName: () => {
      return cloudValue.getFullName() + '__mapped';
    },
    getReference: () => {
      return {
        type: 'MappedDoc',
        over: cloudValue.getReference(),
      };
    },
    get: toGet => {
      throw new Error(
        `Cannot get "${toGet}" on ${cloudValue.getFullName()} because it has been mapped.`,
      );
    },
    observeValueAndId: cloudValue.observeValueAndId
      .distinctUntilChanged()
      .map(data => {
        const value = mapFn(data);
        return { value, getId: () => getIdOfValue(value).id };
      })
      .shareReplay(1),
    getValue: () => mapFn(cloudValue.getValue()),
  };

  bindCloudValueFunctions(mapped, cloudClient);
  return mapped;
}

export default function bindCloudValueFunctions(cloudValue, cloudClient) {
  const evalCache = new Map();
  async function loadValue() {
    return await new Promise((resolve, reject) => {
      let subs = null;
      subs = cloudValue.observeValueAndId.subscribe({
        next: valAndId => {
          subs && subs.unsubscribe();
          resolve({ value: valAndId.value, id: valAndId.getId() });
        },
        error: err => {
          subs && subs.unsubscribe();
          reject(err);
        },
        complete: () => {
          subs && subs.unsubscribe();
        },
      });
    });
  }
  cloudValue.observeValue = cloudValue.observeValueAndId.map(
    valueState => valueState.value,
  );
  cloudValue.loadValue = loadValue;
  cloudValue.map = (...args) => mapCloudValue(cloudValue, cloudClient, ...args);
  cloudValue.expand = (...args) =>
    expandCloudValue(cloudValue, cloudClient, ...args);
  cloudValue.eval = (...args) =>
    evalCloudValue(cloudValue, cloudClient, evalCache, ...args);
}
