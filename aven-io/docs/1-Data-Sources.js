import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Tutorial 1 - Data Sources</Title>
      <Body>Hello, world!</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: '1: Intro to Data Sources',
};
DocPage.path = 'intro-data-sources';

export default DocPage;
