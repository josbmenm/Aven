import { useState, useEffect } from "react";

export default function useRefValue(ref) {
  const observable = ref.observeValue;
  const [value, setValue] = useState(observable.value);

  useEffect(
    () => {
      const subscription = observable.subscribe(setValue);
      return () => subscription.unsubscribe();
    },
    [ref]
  );

  return value;
}
