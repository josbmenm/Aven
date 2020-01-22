import React from 'react';
import useFocus from '../navigation-hooks/useFocus';
import { View } from 'react-native';
import {
  TextInput,
  Stack,
  Button,
  AsyncButton,
  Text,
  Heading,
} from '../dash-ui';
import { useCloudClient, useStream } from '../cloud-core/KiteReact';
import InternalPage from '../maui-web/InternalPage';
import Link from '../maui-web/Link';

function TokenCollector({ onToken, onCancel, verification }) {
  const [token, setToken] = React.useState('');
  function handleSubmit() {
    return onToken(token);
  }
  const inputRenderers = [
    inputProps => (
      <TextInput
        label="verification token"
        mode="code"
        maxLength={6}
        onValue={setToken}
        value={token}
        {...inputProps}
      />
    ),
  ];
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });
  return (
    <Stack>
      <Text>Paste the code that we sent to {verification.email}</Text>
      {inputs}
      <Stack horizontal>
        <AsyncButton title="log in" onPress={handleSubmit} />
        <AsyncButton title="cancel" outline onPress={onCancel} />
      </Stack>
    </Stack>
  );
}

function EmailCollector({ onEmail }) {
  const [email, setEmail] = React.useState('eric@onofood.co');
  function handleSubmit() {
    return onEmail(email);
  }
  const inputRenderers = [
    inputProps => (
      <TextInput
        label="email address"
        mode="email"
        maxLength={24}
        onValue={setEmail}
        value={email}
        {...inputProps}
      />
    ),
  ];
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });

  return (
    <Stack>
      <Text>Sign in with your @onofood.co email.</Text>
      {inputs}
      <AsyncButton title="Log in" onPress={handleSubmit} />
    </Stack>
  );
}

function EmailLoginForm() {
  const client = useCloudClient();

  const clientState = useStream(client.clientState);

  if (!clientState) return null;

  if (clientState && clientState.session) {
    return (
      <Stack>
        <Heading
          title={`Logged in as ${clientState.session.accountId}`}
          theme={{ headingFontSize: 24 }}
        />
        <AsyncButton
          title="Log out"
          onPress={async () => {
            await client.logout();
          }}
        />
      </Stack>
    );
  }

  if (clientState && clientState.verification) {
    return (
      <React.Fragment>
        <Heading title="Internal Log In" theme={{ headingFontSize: 24 }} />
        <TokenCollector
          onCancel={async () => {
            await client.logout();
          }}
          onToken={async code => {
            await client.verifyLogin({ code });
          }}
          verification={clientState.verification}
        />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Heading title="Internal Log In" theme={{ headingFontSize: 24 }} />
      <EmailCollector
        onEmail={async email => {
          await client.login({
            verificationInfo: {
              email,
            },
          });
        }}
      />
    </React.Fragment>
  );
}

function SmallPage({ children }) {
  return (
    <View
      style={{
        alignSelf: 'center',
        maxWidth: 320,
        borderWidth: 3,
        borderRadius: 8,
        borderColor: '#F8C1B9',
        padding: 12,
      }}
    >
      {children}
    </View>
  );
}

export default function LoginScreen() {
  return (
    <InternalPage>
      <SmallPage>
        <EmailLoginForm />
      </SmallPage>
    </InternalPage>
  );
}

LoginScreen.navigationOptions = {
  title: 'Login',
};
