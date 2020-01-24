import React from 'react';
import InternalPage from './InternalPage';
import AuthenticatedRedirectWrapper from './AuthenticatedRedirectWrapper';
import { Heading, AsyncButton } from '../dash-ui';
import { useCloudClient } from '../cloud-core/KiteReact';

function InternalAccountPage() {
  const client = useCloudClient();

  return (
    <InternalPage>
      <AuthenticatedRedirectWrapper>
        <Heading title="Account" />
        <AsyncButton
          title="log out"
          onPress={async () => {
            await client.logout();
          }}
        />
        <AsyncButton
          title="destroy account"
          onPress={async () => {
            await client.destroyAccount();
          }}
        />
      </AuthenticatedRedirectWrapper>
    </InternalPage>
  );
}

InternalAccountPage.navigationOptions = ({ screenProps }) => {
  return {
    title: 'Account',
  };
};

export default InternalAccountPage;
