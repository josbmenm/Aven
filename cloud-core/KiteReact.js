import React from 'react';
import { streamGet } from './StreamValue';
import { streamOf, combineStreams } from './createMemoryStream';
import { createReducerStream, valueMap } from './Kite';

export const CloudContext = React.createContext(null);

export function useCloudClient() {
  return React.useContext(CloudContext);
}

export function useCloud() {
  const cloudClient = useCloudClient();
  return cloudClient.getCloud ? cloudClient.getCloud() : cloudClient; // hacky temp.. should always .getCloud on a real client..
}

export function useStream(stream) {
  const isStream = !!stream && !!stream.addListener;

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
export function useValue(value) {
  return useStream(value && value.stream);
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

export function useCloudSmartReducer(
  actionDocName,
  answersDocName,
  cloudReducer,
) {
  if (cloudReducer.type !== 'CloudReducer') {
    throw new Error(
      'Invalid cloud reducer provided to useCloudReducer. Create one with defineCloudReducer',
    );
  }
  const cloud = useCloud();
  const actionsDoc = cloud.get(actionDocName);
  const answersDoc = cloud.get(answersDocName);

  const answerStateStreams = new Map();

  const fullReducedStream = React.useMemo(
    () =>
      createReducerStream(
        actionsDoc,
        cloudReducer.reducerFn,
        cloudReducer.initialState,
        cloudReducer.reducerName,
        id => {
          return answerStateStreams.get(id);
        },
      ),
    [answerStateStreams, actionsDoc, cloudReducer],
  );
  const outputStream = combineStreams({
    actionDoc: actionsDoc.idAndValue.stream,
    answersDoc: answersDoc.idAndValue.stream,
  })
    .map(({ actionDoc, answersDoc }) => {
      if (
        answersDoc.context &&
        actionDoc.id === answersDoc.context.docId &&
        actionDocName === answersDoc.context.docName
      ) {
        const [stream] = streamOf(answersDoc, {
          type: 'PrecomputedDocState',
          id: answersDoc.id,
          context: answersDoc.context,
        });
        answerStateStreams.set(actionDoc.id, stream);
        return stream;
      }
      return fullReducedStream;
    })
    .flatten();
  const reducedState = useStream(valueMap(outputStream));

  if (reducedState === undefined) {
    return [undefined, actionsDoc.putTransactionValue];
  }
  return [reducedState, actionsDoc.putTransactionValue];
}

export function useCloudReducer(actionDocName, cloudReducer) {
  if (cloudReducer.type !== 'CloudReducer') {
    throw new Error(
      'Invalid cloud reducer provided to useCloudReducer. Create one with defineCloudReducer',
    );
  }
  const cloud = useCloud();
  const actionsDoc = cloud.get(actionDocName);

  const reducedStream = React.useMemo(
    () =>
      createReducerStream(
        actionsDoc,
        cloudReducer.reducerFn,
        cloudReducer.initialState,
        cloudReducer.reducerName,
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
