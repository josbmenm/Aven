import React from 'react';
import AuthenticatedNetworkCloudProvider from '../cloud-native/AuthenticatedNetworkCloudProvider';
import App from './App';
import { YellowBox } from '@rn';

YellowBox.ignoreWarnings(['Async Storage has been']);

export default function MainApp() {
  return (
    <AuthenticatedNetworkCloudProvider
      authority="localhost:3000"
      useSSL={false}
      domain="todo.aven.io"
      auth={null}
    >
      <App />
    </AuthenticatedNetworkCloudProvider>
  );
}
