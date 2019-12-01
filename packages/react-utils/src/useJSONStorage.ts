import { useState, useEffect } from 'react';
import { AsyncStorage } from 'react-native';
import useAsyncError from './useAsyncError';

const UNLOADED_STATE = {};

export function isStorageStateUnloaded(s: any) {
  return s === UNLOADED_STATE;
}

export async function getJSON(storageKey: string, defaultValue: JSON) {
  const stored = await AsyncStorage.getItem(storageKey);
  if (stored === null) {
    return defaultValue;
  }
  return JSON.parse(stored);
}

export async function storeJSON(storageKey: string, newState: JSON) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(newState));
}

export default function useJSONStorage(storageKey: string, defaultValue: JSON) {
  const [storageState, setInternalStorageState] = useState(UNLOADED_STATE);
  const handleErrors = useAsyncError();

  useEffect(() => {
    async function get() {
      const state = await getJSON(storageKey, defaultValue);
      setInternalStorageState(state);
    }
    handleErrors(get());
  }, [storageKey, defaultValue, handleErrors]);

  async function store(storageKey: string, newState: JSON) {
    const lastState = storageState;
    setInternalStorageState(newState);
    try {
      await storeJSON(storageKey, newState);
    } catch (e) {
      setInternalStorageState(lastState);
      throw e;
    }
  }

  function setStorageState(newState: JSON) {
    handleErrors(store(storageKey, newState));
  }

  return [storageState, setStorageState];
}

export function useStorageMemo(storageKey: string, onGetInitial: () => JSON) {
  const [storageState, setInternalStorageState] = useState(UNLOADED_STATE);
  const handleErrors = useAsyncError();

  useEffect(() => {
    handleErrors(
      AsyncStorage.getItem(storageKey).then((stored: string | null) => {
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
  }, [storageKey, onGetInitial, handleErrors]);

  return storageState;
}
