import React from 'react';
import {
  Title,
  Body,
  Page,
  Link,
  Snippet,
  SubSection,
  List,
  ListItem,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - startFSStorageSource</Title>
      <Body>
        This module is used to save data into the local file system with folders
        and JSON files, for a given domain.
      </Body>
      <Snippet
        code={`
import startFSStorageSource from "@aven-cloud/cloud-fs/startFSStorageSource";

const source = await startFSStorageSource({
  domain: 'mydomain',
  dataDir: './myData'
});`}
      />
      <Body>
        The resulting FS storage source conforms to{' '}
        <Link routeName="Spec-Source">the source API</Link>.
      </Body>
      <SubSection title="Options">
        <List>
          <ListItem>`domain` - what domain are we saving data for</ListItem>
          <ListItem>
            `dataDir` - the local directory to save and retrieve the stored
            files
          </ListItem>
        </List>
      </SubSection>
      <Body>
        Careful! You should only run a single server against the data dir.
        Otherwise observing will break, because and all doc changes are managed
        by the fs storage source in memory. If you want to run multiple JS
        servers against a single storage mechanism, use the{' '}
        <Link routeName="API-startPostgresStorageSource">
          Postgres Storage Source.
        </Link>
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - startFSStorageSource',
};
DocPage.path = 'api-start-fs-storage-source';

export default DocPage;
