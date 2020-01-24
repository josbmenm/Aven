import React from 'react';
import { useCloudClient, useStream } from '../cloud-core/KiteReact';
import { useNavigation } from '../navigation-hooks/Hooks';

export default function AuthenticatedRedirectWrapper({ children }) {
  const client = useCloudClient();
  const clientState = useStream(client.clientState);
  const navigation = useNavigation();
  React.useEffect(() => {
    if (!clientState.session) {
      navigation.navigate('Login');
    }
  }, [clientState]);
  if (!clientState.session) return null;
  return children;
}
