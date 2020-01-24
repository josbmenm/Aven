import React from 'react';
import InternalPage from './InternalPage';
import { Heading } from '../dash-ui';
import AuthenticatedRedirectWrapper from './AuthenticatedRedirectWrapper';

function InternalMenuPage() {
  return (
    <InternalPage>
      <AuthenticatedRedirectWrapper>
        <Heading title="Menu Coming Soon" />
      </AuthenticatedRedirectWrapper>
    </InternalPage>
  );
}

InternalMenuPage.navigationOptions = ({ screenProps }) => {
  return {
    title: 'Menu',
  };
};

export default InternalMenuPage;
