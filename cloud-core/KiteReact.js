import React from 'react';
import xs from 'xstream';
import { streamGet } from './Kite';

export const CloudContext = React.createContext(null);

export function useCloud() {
  return React.useContext(CloudContext);
}

export function useStream(stream) {
  const isStream = !!stream && !!stream.subscribe;

  const [value, setValue] = React.useState(
    isStream ? streamGet(stream) : stream,
  );

  const [error, setError] = React.useState(null);

  const lastRef = React.useRef(value);

  function applyValue(newValue) {
    // We use this lastRef to ensure that we will only setValue when the value has actually changed.
    // This is a good idea because some observables will re-emit identical values, and we'd rather not waste a render
    if (lastRef.current !== newValue) {
      lastRef.current = newValue;
      setValue(newValue);
    }
  }

  function applyError(error) {
    setError(error);
  }

  React.useEffect(() => {
    if (error) {
      setError(null);
    }
    if (isStream) {
      const listener = {
        next: applyValue,
        error: applyError,
      };
      stream.addListener(listener);
      return () => {
        stream.removeListener(listener);
      };
    }
  }, [error, isStream, stream]);

  if (error) {
    throw error;
    // This component is basically broken at this point, because error will be thrown here until:
    // - A parent is responsible for catching the error and re-mounting us. OR
    // - The observable input changes and the effect clears the error
  }

  return value;
}

export function useCloudValue(cloudValueInput) {
  let cloudVal = cloudValueInput;
  const cloud = useCloud();
  if (typeof cloudValueInput === 'string') {
    const doc = cloud.get(cloudValueInput);
    cloudVal = doc.value;
  }
  if (!cloudVal.stream) {
    throw new Error('Cloud value must have a stream');
  }
  return useStream(cloudVal.stream);
}

export function createReducerStream(doc, reducerFn, initialState) {
  function streamReduced(val) {
    if (!val) {
      return xs.of(undefined);
    }
    let lastStateStream = undefined;
    if (val.on === null) {
      lastStateStream = xs.of(initialState);
    } else if (val.on.id) {
      lastStateStream = doc
        .getBlock(val.on.id)
        .value.stream.map(childVal => {
          return streamReduced(childVal);
        })
        .flatten();
    } else {
      return xs.of(undefined);
    }
    return lastStateStream.map(lastState => {
      return reducerFn(lastState, val.value);
    });
  }
  return doc.value.stream.map(streamReduced).flatten();
}

export function useCloudReducer(actionDocName, cloudReducer) {
  const cloud = useCloud();
  const actionsDoc = cloud.get(actionDocName);

  const reducedStream = React.useMemo(
    () =>
      createReducerStream(
        actionsDoc,
        cloudReducer.reducerFn,
        cloudReducer.initialState,
      ),
    [actionsDoc, cloudReducer],
  );
  const reducedState = useStream(reducedStream);

  if (reducedState === undefined) {
    return [undefined, actionsDoc.putTransactionValue];
  }
  return [reducedState, actionsDoc.putTransactionValue];
}

export function defineCloudFunction(name, fn, versionId) {
  return {
    type: 'CloudFunction',
    name,
    fn,
    versionId,
  };
}

export function defineCloudReducer(reducerName, reducerFn, initialState) {
  return {
    type: 'CloudReducer',
    reducerName,
    reducerFn,
    initialState,
  };
}
