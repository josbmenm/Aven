import React, { useState, useEffect } from 'react';
import CloudContext from '../aven-cloud/CloudContext';
import createCloudClient from '../aven-cloud/createCloudClient';
import dataSource from './CloudDataSource';
import { AlertIOS } from 'react-native';

export default function AdminSessionContainer({ children }) {
  let [cloud, setCloud] = useState(null);
  useEffect(() => {
    if (!cloud) {
      const newCloud = createCloudClient({
        dataSource,
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
