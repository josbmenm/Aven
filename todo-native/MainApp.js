import React from 'react';
import useAsyncStorage, { isStateUnloaded } from '../utils/useAsyncStorage';
import NetworkCloudProvider from '../cloud-native/NetworkCloudProvider';
import App from './App';
import { YellowBox } from 'react-native';

YellowBox.ignoreWarnings(['Async Storage has been']);

export default function MainApp() {
  const [session, setSession] = useAsyncStorage('Session', null);
  if (isStateUnloaded(session)) {
    return null;
  }
  return (
    <NetworkCloudProvider
      authority="localhost:3000"
      useSSL={false}
      domain="todo.aven.io"
      session={session}
      onSession={setSession}
    >
      <App />
    </NetworkCloudProvider>
  );
}
