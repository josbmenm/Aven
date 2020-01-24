import React from 'react';
import InternalPage from './InternalPage';
import { Heading } from '../dash-ui';
import AuthenticatedRedirectWrapper from './AuthenticatedRedirectWrapper';

function InternalRestaurantPage() {
  return (
    <InternalPage>
      <AuthenticatedRedirectWrapper>
        <Heading title="Restaurant Coming Soon" />
      </AuthenticatedRedirectWrapper>
    </InternalPage>
  );
}

InternalRestaurantPage.navigationOptions = ({ screenProps }) => {
  return {
    title: 'Restaurant',
  };
};

export default InternalRestaurantPage;
