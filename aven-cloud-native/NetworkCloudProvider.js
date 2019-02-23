import React, { useMemo } from 'react';
import createCloudClient from '../aven-cloud/createCloudClient';
import createNativeNetworkSource from './createNativeNetworkSource';
import CloudContext from '../aven-cloud/CloudContext';

export default function NetworkCloudProvider({
  authority,
  useSSL,
  domain,
  children,
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
      });
      return cloud;
    },
    [authority, useSSL, domain]
  );
  return (
    <CloudContext.Provider value={cloud}>{children}</CloudContext.Provider>
  );
}
