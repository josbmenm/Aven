import React, { useMemo } from 'react';
import createCloudClient from '../cloud-core/createCloudClient';
import createNativeNetworkSource from './createNativeNetworkSource';
import CloudContext from '../cloud-core/CloudContext';

export default function NetworkCloudProvider({
  authority,
  useSSL,
  domain,
  children,
  session,
  onSession,
}) {
  const cloud = useMemo(
    () => {
      const source = createNativeNetworkSource({
        authority,
        useSSL,
      });
      const cloud = createCloudClient({
        source,
        domain,
        initialSession: session,
        onSession,
      });
      return cloud;
    },
    [authority, useSSL, domain, onSession],
  );
  return (
    <CloudContext.Provider value={cloud}>{children}</CloudContext.Provider>
  );
}
