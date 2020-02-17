import React from 'react';
import { Title, Body, Page, Link, Snippet } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - createMemoryStorageSource</Title>
      <Body>
        A memory storage source is is used for testing and ephemeral data. It
        will only save data for a single domain:
      </Body>
      <Snippet
        code={`
import createMemoryStorageSource from "@aven-cloud/cloud/createMemoryStorageSource";

const source = createMemoryStorageSource({
  domain: 'mydomain',
});`}
      />
      <Body>
        The resulting memory storage source conforms to{' '}
        <Link routeName="Spec-Source">the source API</Link>.
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - createMemoryStorageSource',
};
DocPage.path = 'api-create-memory-storage-source';

export default DocPage;
