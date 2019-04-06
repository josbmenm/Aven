import React from 'react';
import { Title, Body, Page, List, Snippet, ListItem, Link } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Quick Start</Title>
      <Body>
        The easiest way to start with Aven Cloud is to clone the main repo and
        run the web and native apps:
      </Body>
      <Snippet
        code={`
git clone git@github.com:AvenCloud/Aven.git
cd Aven
yarn
yarn start todo-web
# wait for app to start. In seperate tab, run the RN server:
yarn start todo-native
`}
      />
      <Body>
        To get started, set up the data{' '}
        <Link routeName="Tutorial1">sources for your app</Link>.{' '}
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'QuickStart',
};
DocPage.path = 'quickstart';

export default DocPage;
