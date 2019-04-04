import React from 'react';
import {
  Title,
  Body,
  Page,
  Link,
  List,
  ListItem,
  Snippet,
  SubSection,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - startSourceServer</Title>
      <Body>
        Publish a Source or or a Protected Source over HTTP and WebSockets.
      </Body>
      <Snippet
        code={`import startSourceServer from '@aven-cloud/cloud-server/startSourceServer';
const source = await start*Source(...)

await startSourceServer({
  source,
  listenLocation: 8888
});
// Source is now hosted on localhost:8888
});`}
      />
      <Body>
        The source server provides no security. If you want to put this on the
        public internet, it is reccomended to use a protected source
      </Body>
      <Body>
        HTTPS is not currently supported within the server, but you can use
        nginx or something to accomplish that, proxying this server.
      </Body>
      <SubSection title="API">
        <List>
          <ListItem>
            source - the Source or Protected Source to publish
          </ListItem>
          <ListItem>
            listenLocation - the port or Unix socket to serve HTTPS+WS
          </ListItem>
          <ListItem>expressRouting(app) - a callback to add routes</ListItem>
          <ListItem>fallbackExpressRouting(app) - </ListItem>
          <ListItem>quiet</ListItem>
        </List>
      </SubSection>
      <SubSection title="Example with a web app">
        <Snippet
          code={`import 

const server = await startSourceServer({
  source,
  listenLocation: serverListenLocation,
  expressRouting: doExpressRouting,
  fallbackExpressRouting: doFallbackExpressRouting,
});


startSourceServer({
  source,
  listenLocation,
  expressRouting = undefined,
  fallbackExpressRouting = undefined,
  quiet = false,
})
});`}
        />
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - startSourceServer',
};
DocPage.path = 'api-start-source-server';

export default DocPage;
