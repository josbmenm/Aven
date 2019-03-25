import { useState, useEffect, useRef } from 'react';
import useCloud from './useCloud';

export default function useCloudValue(cloudValueDefinition) {
  let cloudValue = cloudValueDefinition;

  if (typeof cloudValueDefinition === 'string') {
    cloudValue = useCloud().get(cloudValueDefinition);
  }
  const [value, setValue] = useState(cloudValue && cloudValue.getValue());

  const lastRef = useRef(value);

  function applyValue(newValue) {
    if (lastRef.current !== newValue) {
      lastRef.current = newValue;
      setValue(newValue);
    }
  }

  useEffect(
    () => {
      if (!cloudValue) {
        return () => {};
      }
      const subscription = cloudValue.observeValue.subscribe(applyValue);
      return () => subscription.unsubscribe();
    },
    [cloudValue]
  );

  return value;
}
