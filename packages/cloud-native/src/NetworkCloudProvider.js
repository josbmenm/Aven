import React, { useMemo } from 'react';
import { CloudContext, createSessionClient } from '@aven-cloud/cloud-core';
import createNativeNetworkSource from './createNativeNetworkSource';

export default function NetworkCloudProvider({
  authority,
  useSSL,
  domain,
  children,
  session,
}) {
  const cloud = useMemo(() => {
    if (!authority || !domain) {
      return null;
    }
    const source = createNativeNetworkSource({
      authority,
      useSSL,
    });
    const cloud = createSessionClient({
      source,
      domain,
      auth: session,
    });
    return cloud;
  }, [authority, useSSL, domain, session]);
  return (
    <CloudContext.Provider value={cloud}>{children}</CloudContext.Provider>
  );
}
