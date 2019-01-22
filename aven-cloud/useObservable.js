import { useState, useEffect } from 'react';

export default function useObservable(observable) {
  const isObservable = !!observable && !!observable.subscribe;

  const [value, setValue] = useState(
    isObservable ? observable.value : observable
  );

  useEffect(
    () => {
      if (isObservable) {
        const subscription = observable.subscribe(setValue);
        return () => subscription.unsubscribe();
      }
    },
    [observable]
  );

  return value;
}
