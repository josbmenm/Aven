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
      <Title>API - createNodeNetworkSource</Title>
      <Body>
        This module is used inside Node.js programs to connect to a Source on
        another remote server.
      </Body>
      <Body>
        You can use this module as a Protected Source or a Source. It will proxy
        the actual behavior of the remote Source, "Protected" or not.
      </Body>

      <Section title="Usage">
        <Snippet
          code={`const source = createNodeNetworkSource({
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
  title: 'API - createNodeNetworkSource',
};
DocPage.path = 'api-create-native-network-source';

export default DocPage;
