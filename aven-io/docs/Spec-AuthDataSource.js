import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Spec - AuthDataSource</Title>
      <Body>Coming Soon.</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Spec - AuthDataSource',
};
DocPage.path = 'spec-auth-data-source';

export default DocPage;
