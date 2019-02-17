import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Tutorial 3 - Authentication</Title>
      <Body>Hello, world!</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: '3: Authentication',
};
DocPage.path = 'intro-auth';

export default DocPage;
