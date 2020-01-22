import React from 'react';
import InternalPage from './InternalPage';
import { Heading, AsyncButton } from '../dash-ui';
import { useCloudClient } from '../cloud-core/KiteReact';

function InternalAccountPage() {
  const client = useCloudClient();

  return (
    <InternalPage>
      <Heading title="Account" />
      <AsyncButton
        title="Log out"
        onPress={async () => {
          await client.logout();
        }}
      />
    </InternalPage>
  );
}

InternalAccountPage.navigationOptions = ({ screenProps }) => {
  return {
    title: 'Account',
  };
};

export default InternalAccountPage;
