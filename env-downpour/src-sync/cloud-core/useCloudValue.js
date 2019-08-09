import { useState, useEffect, useRef } from 'react';
import useCloud from './useCloud';

export default function useCloudValue(cloudValueDefinition) {
  let cloudValue = cloudValueDefinition;
  const cloud = useCloud();

  if (typeof cloudValueDefinition === 'string') {
    cloudValue = cloud && cloud.get(cloudValueDefinition);
  }
  const [value, setValue] = useState(cloudValue && cloudValue.getValue());

  const [error, setError] = useState(null);

  if (error) {
    throw error;
    // This component is basically broken at this point, because error will be thrown here until:
    // - A parent is responsible for catching the error and re-mounting us. OR
    // - The observable input changes and the effect clears the error
  }

  const lastRef = useRef(value);

  function applyValue(newValue) {
    if (lastRef.current !== newValue) {
      lastRef.current = newValue;
      setValue(newValue);
    }
  }

  function applyError(error) {
    setError(error);
  }

  useEffect(() => {
    if (!cloudValue) {
      return () => {};
    }
    if (error) {
      setError(null);
    }
    const subscription = cloudValue.observeValue.subscribe(
      applyValue,
      applyError,
    );
    return () => subscription.unsubscribe();
  }, [cloudValue, error]);

  return value;
}
