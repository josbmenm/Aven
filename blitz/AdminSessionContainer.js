import React, { useState, useEffect } from 'react';
import CloudContext from '../cloud-core/CloudContext';
import createCloudClient from '../cloud-core/createCloudClient';
import source from './OnoCloud';
import { AlertIOS } from 'react-native';

export default function AdminSessionContainer({ children }) {
  let [cloud, setCloud] = useState(null);
  useEffect(() => {
    if (!cloud) {
      const newCloud = createCloudClient({
        source,
        domain: 'onofood.co',
      });
      AlertIOS.prompt('Login', 'Root password', password => {
        newCloud
          .CreateSession({
            accountId: 'root',
            verificationResponse: { password },
            verificationInfo: { type: 'root' },
          })
          .then(() => {
            setCloud(newCloud);
          })
          .catch(console.error);
      });
    }
  }, []);
  if (!cloud) {
    return null;
  }
  return (
    <CloudContext.Provider value={cloud}>{children}</CloudContext.Provider>
  );
}
