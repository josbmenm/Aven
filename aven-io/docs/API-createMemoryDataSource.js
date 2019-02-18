import React from 'react';
import { Title, Body, Page, Link, Snippet } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - createMemoryDataSource</Title>
      <Body>
        A memory data source is created on a per-domain basis. It will only save
        data for the single domain:
      </Body>
      <Snippet
        code={`
import createMemoryDataSource from "@aven-cloud/cloud/createMemoryDataSource";

const dataSource = createMemoryDataSource({
  domain: 'mydomain',
});`}
      />
      <Body>
        Creates an in-memory storage for some data. Particularly useful for
        testing or ephemeral data.
      </Body>
      <Body>
        The memory data source conforms to{' '}
        <Link routeName="Spec-DataSource">the data source API</Link>.
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - createMemoryDataSource',
};
DocPage.path = 'api-create-memory-data-source';

export default DocPage;
