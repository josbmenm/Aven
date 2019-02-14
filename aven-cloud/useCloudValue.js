import { useState, useEffect, useRef } from 'react';

export default function useCloudValue(cloudValue) {
  const [value, setValue] = useState(cloudValue.getValue());

  const lastRef = useRef(value);

  function applyValue(newValue) {
    if (lastRef.current !== newValue) {
      lastRef.current = newValue;
      setValue(newValue);
    }
  }

  useEffect(
    () => {
      const subscription = cloudValue.observeValue.subscribe(applyValue);
      return () => subscription.unsubscribe();
    },
    [cloudValue]
  );

  return value;
}
