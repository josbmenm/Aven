import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - Cloud Value</Title>
      <Body>Coming Soon.</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - Cloud Value',
};
DocPage.path = 'api-cloud-value';

export default DocPage;
