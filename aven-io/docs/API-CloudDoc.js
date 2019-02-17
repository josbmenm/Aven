import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - Cloud Doc</Title>
      <Body>Coming Soon.</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - Cloud Doc',
};
DocPage.path = 'api-cloud-doc';

export default DocPage;
