import React, { useMemo } from 'react';
import createCloudClient from '../aven-cloud/createCloudClient';
import createBrowserNetworkSource from './createBrowserNetworkSource';
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
      const dataSource = createBrowserNetworkSource({
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
