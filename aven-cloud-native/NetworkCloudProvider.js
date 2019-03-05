import React, { useMemo } from 'react';
import createCloudClient from '../aven-cloud/createCloudClient';
import createNativeNetworkSource from './createNativeNetworkSource';
import CloudContext from '../aven-cloud/CloudContext';

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
      const dataSource = createNativeNetworkSource({
        authority,
        useSSL,
      });
      const cloud = createCloudClient({
        dataSource,
        domain,
        initialSession: session,
        onSession,
      });
      return cloud;
    },
    [authority, useSSL, domain, onSession]
  );
  return (
    <CloudContext.Provider value={cloud}>{children}</CloudContext.Provider>
  );
}
