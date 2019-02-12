import { useState, useEffect, useRef } from 'react';

export default function useObservable(observable) {
  const isObservable = !!observable && !!observable.subscribe;

  const [value, setValue] = useState(
    isObservable ? observable.value : observable
  );

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
        const subscription = observable.subscribe(applyValue);
        return () => subscription.unsubscribe();
      }
    },
    [observable]
  );

  return value;
}
