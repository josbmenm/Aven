import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Tutorial 3 - Authentication</Title>
      <Body>
        Coming soon. TLDR: use createProtectedSource, set up auth providers, and
        use authentication APIs on the client.
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: '3: Authentication',
};
DocPage.path = 'intro-auth';

export default DocPage;
