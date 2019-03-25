import React from 'react';
import { Title, Body, Page, SubSection, Snippet, Link } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Tutorial 1 - Creating Sources and Clients</Title>
      <Body>
        We're making a chat app, but we need to save and sync our data. Our
        "Sources" define where the data is saved, and how it is connected to the
        app.
      </Body>
      <SubSection title="Our First Source">
        <Body>
          For testing, we could save our data in memory only. In production we
          should connect to a real database like Postgres. But for now, let's
          save our app data as files.
        </Body>

        <Body>
          We also need to invent a "domain" to use, a named bucket for your
          app's data to live in. Because we're creating a chat app, lets use
          "chat.aven.io"
        </Body>
        <Snippet
          code={`import startFSDataSource from '@aven-cloud/cloud-fs/startFSDataSource';
    
const source = await startFSStorageSource({
  domain: 'chat.aven.io', // our new domain
  dataDir: './db', // the path of where the files will be stored
});
      `}
        />
        <Body>
          Great! Now we can call "source.dispatch" to send actions for saving
          and retrieving data. See the full{' '}
          <Link routeName="Spec-Source">Source API Spec here</Link>.
        </Body>
        <Body>
          Note: The FS storage will work fine as long as you only run one server
          against it at a time. If you want to run multiple servers in front of
          a single storage mechanism, use{' '}
          <Link routeName="API-startPostgresStorageSource">
            a postgres storage source
          </Link>
          .
        </Body>
      </SubSection>
      <SubSection title="Over the Network">
        <Body>
          Our node.js program needs to serve the data to the web client or
          native app that runs on the user's device. So we can take our storage
          source and expose it over the network with a server:
        </Body>
        <Snippet
          code={`import startSourceServer from '@aven-cloud/cloud-server/startSourceServer';
    
const server = await startSourceServer({
  source,
  listenLocation: 3000,
});
      `}
        />
        <Body>
          Once this resolves, the Source will be accessible at
          http://localhost:3000
        </Body>
        <Body>Then from the client, we can connect to the Source Server:</Body>
        <Snippet
          code={`import createBrowserNetworkSource from '@aven-cloud/cloud-browser/createBrowserNetworkSource';
    
const source = await createBrowserNetworkSource({
  authority: 'localhost:3000',
  useSSL: false
});
      `}
        />
        <Body>
          Now, the source on the client will have the same behavior as the one
          on the server, allowing us to save data.
        </Body>
      </SubSection>
      <SubSection title="Create a Cloud Client">
        <Body>
          The source API is meant to be easily transmitted over a network, but
          it is inconvenient to use. A client will be useful for hydrating data
          from the source, observing it, and making mutations that appear to be
          reflected immediately.
        </Body>
        <Body>
          Once we have any Source, we can create a "cloud" client to consume
          data within a specified domain:
        </Body>
        <Snippet
          code={`import createCloudClient from '@aven-cloud/cloud/createCloudClient';
    
const cloud = await createCloudClient({
  source,
  domain: 'chat.aven.io'
});
      `}
        />
        <Body>
          Now we can use the client to conveniently write data to the database:
        </Body>
        <Snippet
          code={`const chatRoom = cloud.get('ChatRoom');

// save a new JSON object to the ChatRoom doc:
await chatRoom.put({ messages: ['Hello'] });
      `}
        />
        <Body>
          Any other client connected to the same Source can access the value as
          such:
        </Body>
        <Snippet
          code={`const chatRoom = cloud.get('ChatRoom');
          
// fetch and log the current value of the ChatRoom doc:
await chatRoom.fetchValue();
console.log(chatRoom.getValue());
`}
        />
      </SubSection>
      <Body>
        Let's continue by{' '}
        <Link routeName="Tutorial2">connecting our client to a React App</Link>
        ...
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: '1: Create data Sources',
};
DocPage.path = 'intro-sources';

export default DocPage;
