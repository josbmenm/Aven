import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Data Sources</Title>
      <Body>Coming Soon.</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Data Sources',
};
DocPage.path = 'data-sources';

export default DocPage;
