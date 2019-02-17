import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - Cloud Block</Title>
      <Body>Coming Soon.</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - Cloud Block',
};
DocPage.path = 'api-cloud-block';

export default DocPage;
