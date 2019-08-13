import React from 'react';
import useAsyncError from '../react-utils/useAsyncError';
import useAsyncStorage, { isStateUnloaded } from '../screens/useAsyncStorage';
import { createSessionClient } from '../cloud-core/Kite';

export default function useCloudProvider({
  source,
  domain,
  establishAnonymousSession,
}) {
  const cloud = React.useMemo(() => {
    return createSessionClient({
      source,
      domain,
    });
  }, []);

  return cloud;
}
