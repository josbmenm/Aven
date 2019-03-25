import React from 'react';
import {
  Title,
  Body,
  Page,
  Section,
  Bold,
  Link,
  List,
  ListItem,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Data and Network Sources</Title>
      <Body>
        A <Bold>data source</Bold> is an object that conforms to the{' '}
        <Link routeName="Spec-DataSource">DataSource interface</Link>. It allows
        you to save data to it, retrieve data, and watch for changes. It is
        usually backed by some sort of database: Postgres, the file system, or
        storage on the browser and React Native.
      </Body>
      <Body>
        A <Bold>network source</Bold> is another data source, proxied over a
        network interface. It has the same{' '}
        <Link routeName="Spec-DataSource">DataSource interface</Link>, and it
        also will correctly pass-through the behavior of a{' '}
        <Link routeName="Spec-AuthDataSource">AuthDataSource interface</Link>.
      </Body>
      <Section title="Data Source Interface">
        <Body>
          The{' '}
          <Link routeName="Spec-DataSource">
            detailed interface is specified here
          </Link>
          , but a data source basically provides two features:
        </Body>
        <List>
          <ListItem>
            <Bold>async dispatch(action): Result</Bold> - a way to asyncronously
            dispatch actions for fetching data, uploading, and requesting
            mutations.
          </ListItem>
          <ListItem>
            <Bold>observeDoc(domain, name): Observable</Bold> - allows you to
            subscribe to document changes
          </ListItem>
        </List>
      </Section>
      <Section title="Included Source Modules">
        <Body>
          Aven Cloud ships with the following data sources, but you can also
          build your own.
        </Body>
        <List>
          <ListItem>
            <Link routeName="API-createMemoryStorageSource">
              MemoryDataSource
            </Link>
            - for testing and ephemeral storage
          </ListItem>
          <ListItem>
            <Link routeName="API-startFSStorageSource">FSDataSource</Link>-
            file-system storage for a single node.js process
          </ListItem>
          <ListItem>
            <Link routeName="API-startPostgresStorageSource">
              PostgresDataSource
            </Link>
            - for several node.js processes in front of PostgreSQL
          </ListItem>
          <ListItem>ReactNativeDataSource - coming soon</ListItem>
          <ListItem>BrowserDataSource - coming soon</ListItem>
        </List>
        <Body>We also provide the following network sources:</Body>
        <List>
          <ListItem>
            <Link routeName="API-createBrowserNetworkSource">
              BrowserNetworkSource
            </Link>
            - for connecting Browser apps to remote sources
          </ListItem>
          <ListItem>
            <Link routeName="API-createNativeNetworkSource">
              NativeNetworkSource
            </Link>
            - for connecting React Native apps to remote sources
          </ListItem>
          <ListItem>
            <Link routeName="API-createNodeNetworkSource">
              NodeNetworkSource
            </Link>
            - for connecting node.js apps to remote sources
          </ListItem>
        </List>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Data Sources',
};
DocPage.path = 'data-sources';

export default DocPage;
