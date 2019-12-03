import React, { useMemo } from 'react';
import { CloudContext, createClient } from '@aven-cloud/cloud-core';
import createBrowserNetworkSource from './createBrowserNetworkSource';

export default function NetworkCloudProvider({
  authority,
  useSSL,
  domain,
  children,
  session,
  onSession,
}) {
  const cloud = useMemo(() => {
    if (!authority || !domain) {
      return null;
    }
    const source = createBrowserNetworkSource({
      authority,
      useSSL,
    });
    const cloud = createClient({
      source,
      domain,
      initialSession: session,
      onSession,
    });
    return cloud;
  }, [authority, useSSL, domain, session, onSession]);
  return (
    <CloudContext.Provider value={cloud}>{children}</CloudContext.Provider>
  );
}
