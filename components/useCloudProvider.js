import React from 'react';
import useAsyncError from '../react-utils/useAsyncError';
import useAsyncStorage, { isStateUnloaded } from '../screens/useAsyncStorage';
import createCloudClient from '../cloud-core/createCloudClient';

export default function useCloudProvider({
  source,
  domain,
  establishAnonymousSession,
}) {
  const [session, setSession] = useAsyncStorage('CloudSession');
  const handleErrors = useAsyncError(e => {
    return true;
  });

  const cloud = React.useMemo(() => {
    if (isStateUnloaded(session)) {
      return null;
    }
    return createCloudClient({
      source,
      domain,
      initialSession: session,
      onSession: s => {
        setSession(s);
      },
    });
  }, [source, domain, isStateUnloaded(session)]);

  React.useEffect(() => {
    if (!cloud || !establishAnonymousSession) {
      return;
    }
    handleErrors(cloud.establishAnonymousSession());
  }, [cloud, establishAnonymousSession]);

  return cloud;
}
