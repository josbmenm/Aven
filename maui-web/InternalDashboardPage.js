import React from 'react';
import InternalPage from './InternalPage';
import { Heading } from '../dash-ui';

function InternalDashboardPage() {
  return (
    <InternalPage>
      <Heading title="Dashboard Coming Soon" />
    </InternalPage>
  );
}

InternalDashboardPage.navigationOptions = ({ screenProps }) => {
  return {
    title: 'Dashboard',
  };
};

export default InternalDashboardPage;
