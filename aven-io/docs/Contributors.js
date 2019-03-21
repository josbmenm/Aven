import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Contributors</Title>
      <Body>
        There are a lot of ways to help! To get started, jump in the issues and
        attempt to fix something, or respond to people who have questions.
      </Body>
      <Body>
        You are also encouraged to create additional projects to compliment or
        compete with Aven Cloud components.
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Contributors',
};
DocPage.path = 'contributors';

export default DocPage;
