import React from 'react';
import {
  Title,
  Body,
  Page,
  Snippet,
  SubSection,
  Link,
  List,
  ListItem,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - startPostgresStorageSource</Title>
      <Body>
        This module is used to save data into a running postgres server.
      </Body>
      <Snippet
        code={`
import startPostgresStorageSource from "@aven-cloud/cloud-fs/startPostgresStorageSource";

const source = await startPostgresStorageSource({
  config: DB_CONFIG,
  domains: ['test.aven.io'],
});`}
      />
      <Body>
        The resulting storage source conforms to{' '}
        <Link routeName="Spec-Source">the source API</Link>.
      </Body>
      <SubSection title="Options">
        <List>
          <ListItem>`domains` - what domains are we saving data for</ListItem>
          <ListItem>`config` - the postgres connection info</ListItem>
        </List>
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - startPostgresStorageSource',
};
DocPage.path = 'api-create-postgres-storage-source';

export default DocPage;
