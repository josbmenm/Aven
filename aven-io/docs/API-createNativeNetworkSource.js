import React from 'react';
import {
  Title,
  Body,
  Page,
  Snippet,
  Section,
  List,
  ListItem,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - createNativeNetworkSource</Title>
      <Body>
        This module is used inside React Native apps to connect to a data source
        or auth source on a remote server.
      </Body>
      <Body>
        You can use this module *as* an auth source or data source, and it will
        proxy the behavior of the remote source.
      </Body>
      <Section title="Usage">
        <Snippet
          code={`const dataSource = createNativeNetworkSource({
  authority: 'my.server.dev',
  useSSL: true,
});
      `}
        />
      </Section>
      <Section title="API">
        <List>
          <ListItem>
            "authority" - the domain/host of the remote server, including port
          </ListItem>
          <ListItem>
            "useSSL" - true if wss/https should be used instead of ws/http
            protocols
          </ListItem>
        </List>
        <Body />
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - createNativeNetworkSource',
};
DocPage.path = 'api-create-native-network-source';

export default DocPage;
