import React from 'react';
import { Title, Body, Page, SubSection, Snippet } from '../DocViews';

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
      <SubSection title="Getting Started - Run Docs">
        <Snippet
          code={`git clone Aven
cd Aven
yarn
yarn start aven-io`}
        />
      </SubSection>
      <SubSection title="Getting Started - Run Todo app">
        <Body>First, start the web version</Body>
        <Snippet
          code={`git clone Aven
cd Aven
yarn
yarn start todo-web`}
        />
        <Body>Simultaneously, start up the react native app..</Body>
        <Snippet
          code={`
yarn start todo-native`}
        />
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Contributors',
};
DocPage.path = 'contributors';

export default DocPage;
