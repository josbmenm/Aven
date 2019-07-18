import { useState, useEffect } from 'react';
import { AsyncStorage } from 'react-native';
import useAsyncError from '../react-utils/useAsyncError';

const UNLOADED_STATE = {};

export function isStateUnloaded(s) {
  return s === UNLOADED_STATE;
}

export default function useAsyncStorage(storageKey, defaultValue) {
  const unloadedValue = UNLOADED_STATE;
  const [storageState, setInternalStorageState] = useState(unloadedValue);
  const handleErrors = useAsyncError();

  useEffect(() => {
    handleErrors(
      AsyncStorage.getItem(storageKey).then(stored => {
        if (stored === null) {
          setInternalStorageState(defaultValue);
        } else {
          setInternalStorageState(JSON.parse(stored));
        }
      }),
    );
  }, [storageKey]);

  function setStorageState(newState) {
    if (isStateUnloaded(storageState)) {
      throw new Error(
        'Cannot merge storage state if it has not been loaded yet!',
      );
    }
    setInternalStorageState(newState);
    AsyncStorage.setItem(storageKey, JSON.stringify(newState)).catch(
      console.error,
    );
  }

  return [storageState, setStorageState];
}

export function useStorageMemo(storageKey, onGetInitial) {
  const unloadedValue = UNLOADED_STATE;
  const [storageState, setInternalStorageState] = useState(unloadedValue);
  const handleErrors = useAsyncError();

  useEffect(() => {
    handleErrors(
      AsyncStorage.getItem(storageKey).then(stored => {
        if (stored === null) {
          const initValue = onGetInitial();
          handleErrors(
            AsyncStorage.setItem(storageKey, JSON.stringify(initValue)),
          );
          setInternalStorageState(initValue);
        } else {
          setInternalStorageState(JSON.parse(stored));
        }
      }),
    );
  }, [storageKey]);

  function setStorageState(newState) {
    if (isStateUnloaded(storageState)) {
      throw new Error(
        'Cannot merge storage state if it has not been loaded yet!',
      );
    }
    setInternalStorageState(newState);
    AsyncStorage.setItem(storageKey, JSON.stringify(newState)).catch(
      console.error,
    );
  }

  return storageState;
}
