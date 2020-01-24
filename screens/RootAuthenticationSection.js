import React from 'react';
import { View } from 'react-native';
import useObservable from '../cloud-core/useObservable';
import { useCloud } from '../cloud-core/KiteReact';
import BlockFormRow from '../components/BlockFormRow';
import BlockFormMessage from '../components/BlockFormMessage';
import useAsyncError from '../react-utils/useAsyncError';
import { SpinnerButton, Heading, TextInput } from '../dash-ui';

function GenericContainer({ children }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row' }}>
      <View style={{ maxWidth: 460, flex: 1, marginVertical: 60 }}>
        {children}
      </View>
    </View>
  );
}
function RootLoginForm() {
  const cloud = useCloud();
  const [pw, setPw] = React.useState('');
  const handleErrors = useAsyncError();
  return (
    <GenericContainer>
      <Heading title="Log in" />
      <BlockFormRow>
        <TextInput
          value={pw}
          label="root password"
          mode="password"
          onValue={v => {
            setPw(v);
          }}
        />
      </BlockFormRow>
      <BlockFormRow>
        <SpinnerButton
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
      </BlockFormRow>
    </GenericContainer>
  );
}

function RootAuthLogin() {
  const cloud = useCloud();
  const session = useObservable(cloud && cloud.observeSession);
  if (session && session.accountId !== 'root') {
    return (
      <GenericContainer>
        <Title>Wrong Authentication</Title>
        <BlockFormMessage>
          Please log out and log back in as root.
        </BlockFormMessage>
        <SpinnerButton
          onPress={() => {
            cloud.destroySession({ ignoreRemoteError: true });
          }}
          title="Log out"
        />
      </GenericContainer>
    );
  }
  return <RootLoginForm />;
}

export default function RootAuthenticationSection({ children }) {
  return children;
  // const cloud = useCloud();
  // const session = useObservable(cloud && cloud.observeSession);
  // if (session && session.accountId === 'root') {
  //   return children;
  // }
  // return <RootAuthLogin />;
}
