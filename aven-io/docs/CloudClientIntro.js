import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Cloud Client Intro</Title>
      <Body>Coming Soon.</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Cloud Client Intro',
};
DocPage.path = 'cloud-client-intro';

export default DocPage;
