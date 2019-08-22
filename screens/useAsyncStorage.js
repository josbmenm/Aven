import { useState, useEffect } from 'react';
import { AsyncStorage } from 'react-native';
import useAsyncError from '../react-utils/useAsyncError';

const UNLOADED_STATE = {};

export function isStateUnloaded(s) {
  return s === UNLOADED_STATE;
}

export async function get(storageKey, defaultValue) {
  const stored = await AsyncStorage.getItem(storageKey);
  if (stored === null) {
    return defaultValue;
  } else {
    return JSON.parse(stored);
  }
}

export async function put(storageKey, newState) {
  console.log('putting!', newState, storageKey);
  await AsyncStorage.setItem(storageKey, JSON.stringify(newState));
  console.log('putted');
}

export default function useAsyncStorage(storageKey, defaultValue) {
  const unloadedValue = UNLOADED_STATE;
  const [storageState, setInternalStorageState] = useState(unloadedValue);
  const handleErrors = useAsyncError();

  async function doGet(storageKey) {
    const state = await get(storageKey, defaultValue);
    setInternalStorageState(state);
  }
  async function doPut(storageKey, newState) {
    console.log('doPut', storageKey, newState);
    const lastState = storageState;
    setInternalStorageState(newState);
    try {
      await put(storageKey, newState);
    } catch (e) {
      setInternalStorageState(lastState);
      throw e;
    }
  }
  useEffect(() => {
    handleErrors(doGet(storageKey));
  }, [storageKey]);

  function setStorageState(newState) {
    handleErrors(doPut(storageKey, newState));
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
