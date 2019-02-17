import React from 'react';
import { Title, Body, Page, List, ListItem, Link } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Quick Start</Title>
      <Body>
        The easiest way to start with Aven Cloud is to clone one of the sample
        repositories:
      </Body>
      <List>
        <ListItem>
          <Link url="https://github.com/AvenCloud/Aven-Example-Isomorphic">
            Isomorphic Example
          </Link>
        </ListItem>
        <ListItem>Client-Only Example</ListItem>
        <ListItem>Server-Only Example</ListItem>
      </List>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'QuickStart',
};
DocPage.path = 'quickstart';

export default DocPage;
