import React from 'react';
import {
  Title,
  Body,
  Page,
  Snippet,
  Section,
  List,
  ListItem,
  SubSection,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - createBrowserNetworkSource</Title>
      <Body>
        This module is used inside a browser app to connect to a server-side
        Source.
      </Body>
      <Body>
        You can use this module as a Protected Source or a Source. It will proxy
        the actual behavior of the remote Source, "Protected" or not.
      </Body>

      <Section title="Usage">
        <Snippet
          code={`const source = createBrowserNetworkSource({
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
      </Section>
      <SubSection title="Implicit Options">
        <Body>
          If you pass `null` in for the authority or useSSL, the network client
          will infer this from the browser's current location.
        </Body>
        <Snippet
          code={`const source = createBrowserNetworkSource({
  authority: null,
  useSSL: null,
});
// The browser will attempt to connect to the server it was loaded from
      `}
        />
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - createBrowserNetworkSource',
};
DocPage.path = 'api-create-native-network-source';

export default DocPage;
