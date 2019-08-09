import React, { useMemo } from 'react';
import { createClient } from '../cloud-core/Kite';
import createNativeNetworkSource from './createNativeNetworkSource';
import { CloudContext } from '../cloud-core/KiteReact';

export default function AuthenticatedNetworkCloudProvider({
  authority,
  useSSL,
  domain,
  children,
  auth,
}) {
  const cloud = useMemo(() => {
    const source = createNativeNetworkSource({
      authority,
      useSSL,
    });
    const cloud = createClient({
      source,
      domain,
      auth,
    });
    return cloud;
  }, [authority, useSSL, domain, auth]);
  return (
    <CloudContext.Provider value={cloud}>{children}</CloudContext.Provider>
  );
}
