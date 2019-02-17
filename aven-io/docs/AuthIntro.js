import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Authentication Intro</Title>
      <Body>Coming Soon.</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Authentication Intro',
};
DocPage.path = 'auth-overview';

export default DocPage;
