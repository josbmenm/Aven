import React from 'react';
import { View } from 'react-native';
import useObservable from '../cloud-core/useObservable';
import useCloud from '../cloud-core/useCloud';
import Title from '../components/Title';
import BlockFormButton from '../components/BlockFormButton';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormInput from '../components/BlockFormInput';
import useAsyncError from '../react-utils/useAsyncError';

function RootLoginForm() {
  const cloud = useCloud();
  const [pw, setPw] = React.useState('');
  const handleErrors = useAsyncError();
  return (
    <View>
      <Title>Log In</Title>
      <BlockFormInput
        value={pw}
        label="root password"
        mode="password"
        onValue={v => {
          setPw(v);
        }}
      />
      <BlockFormButton
        title="Log In"
        onPress={() => {
          handleErrors(
            cloud
              .createSession({
                accountId: 'root',
                verificationInfo: {},
                verificationResponse: { password: pw },
              })
              .then(async resp => {
                console.log('createSession succes', resp);
              }),
          );
        }}
      />
    </View>
  );
}

function RootAuthLogin() {
  const cloud = useCloud();
  const session = useObservable(cloud && cloud.observeSession);
  if (session && session.accountId !== 'root') {
    return (
      <View>
        <Title>Wrong Authentication</Title>
        <BlockFormMessage>
          Please log out and log back in as root.
        </BlockFormMessage>
        <BlockFormButton
          onPress={() => {
            cloud.destroySession({ ignoreRemoteError: true });
          }}
          title="Log out"
        />
      </View>
    );
  }
  return <RootLoginForm />;
}

export default function RootAuthenticationSection({ children }) {
  const cloud = useCloud();
  const session = useObservable(cloud && cloud.observeSession);
  if (session && session.accountId === 'root') {
    return children;
  }
  return <RootAuthLogin />;
}
