import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Spec - AuthProvider</Title>
      <Body>Coming Soon.</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Spec - AuthProvider',
};
DocPage.path = 'spec-auth-provider';

export default DocPage;
