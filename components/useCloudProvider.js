import React from 'react';
import { createSessionClient } from '../cloud-core/Kite';

export default function useCloudProvider({ source, domain }) {
  const cloud = React.useMemo(() => {
    return createSessionClient({
      source,
      domain,
    });
  }, [source, domain]);

  return cloud;
}
