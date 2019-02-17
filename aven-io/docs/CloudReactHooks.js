import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Cloud React Hooks</Title>
      <Body>Coming Soon.</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Cloud React Hooks',
};
DocPage.path = 'cloud-react-hooks';

export default DocPage;
