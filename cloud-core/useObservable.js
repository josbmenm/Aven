import { useState, useEffect, useRef } from 'react';

export default function useObservable(observable) {
  const isObservable = !!observable && !!observable.subscribe;

  const [value, setValue] = useState(
    isObservable ? observable.value : observable
  );

  const [error, setError] = useState(null);

  if (error) {
    throw error;
    // This component is basically broken at this point.. A parent is responsible for catching the error and re-mounting us.
  }

  const lastRef = useRef(value);

  function applyValue(newValue) {
    if (lastRef.current !== newValue) {
      lastRef.current = newValue;
      setValue(newValue);
    }
  }

  useEffect(
    () => {
      if (isObservable) {
        const subscription = observable.subscribe(applyValue, setError);
        return () => subscription.unsubscribe();
      }
    },
    [observable]
  );

  return value;
}
