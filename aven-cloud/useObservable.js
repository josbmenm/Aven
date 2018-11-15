import { useState, useEffect } from "react";

export default function useObservable(observable) {
  const [value, setValue] = useState(observable && observable.value);

  useEffect(
    () => {
      const subscription = observable.subscribe(setValue);
      return () => subscription.unsubscribe();
    },
    [observable]
  );

  return value;
}
