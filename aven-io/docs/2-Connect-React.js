import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Tutorial 2 - Connect Cloud to React</Title>
      <Body>Hello, world!</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: '2: Connect to React',
};
DocPage.path = 'intro-connect-react';

export default DocPage;
