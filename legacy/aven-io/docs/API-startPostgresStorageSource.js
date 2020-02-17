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
        This module is used to save data into a running postgres server. Because
        all source-of-truth is delegated to Postgres, it will be safe to run
        several node servers pointing to the same postgres DB. (this is not the
        case with the FS storage source)
      </Body>
      <Snippet
        code={`
import startPostgresStorageSource from "@aven-cloud/cloud-fs/startPostgresStorageSource";

const source = await startPostgresStorageSource({
  config: 'postgresql://postgres:aven-test-password@localhost:5432/postgres',
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
          <ListItem>
            `config` - the postgres connection info, as passed to knex
          </ListItem>
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
