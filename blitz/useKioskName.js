import { useState, useEffect } from 'react';
import { AsyncStorage } from 'react-native';
import uuid from 'uuid/v1';

const UNLOADED_STATE = {};

export function isStateUnloaded(s) {
  return s === UNLOADED_STATE;
}

function useAsyncStorage(storageKey, defaultValue) {
  // copy-pasted from Admin interface, todoo deduplicate!!!!
  const unloadedValue = UNLOADED_STATE;
  const [storageState, setInternalStorageState] = useState(unloadedValue);

  useEffect(
    () => {
      AsyncStorage.getItem(storageKey)
        .then(stored => {
          if (stored === null) {
            setInternalStorageState(defaultValue);
          } else {
            setInternalStorageState(JSON.parse(stored));
          }
        })
        .catch(console.error);
    },
    [storageKey],
  );

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

export default function useKioskName() {
  let [name, setName] = useAsyncStorage('KioskName', uuid());

  return [name, setName];
}
