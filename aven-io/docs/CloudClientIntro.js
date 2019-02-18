import React from 'react';
import { Title, Body, Page, Link, Snippet } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Cloud Client Intro</Title>
      <Body>
        The <Link routeName="API-createCloudClient">cloud client</Link> provides
        an in-memory representation of a domain within a{' '}
        <Link routeName="API-DataSource">data source</Link>, which provides the
        ability to observe and optimistically mutate data within the source.
      </Body>
      <Body>It requires a data source or a network source upon creation:</Body>
      <Snippet
        code={`
import createMemoryDataSource from "@aven-cloud/cloud/createMemoryDataSource";
import createCloudClient from "@aven-cloud/cloud/createCloudClient";

const dataSource = createMemoryDataSource({
  domain: 'mydomain',
});

const client = createCloudClient({
  dataSource,
  domain: 'mydomain',
});
`}
      />
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Cloud Client Intro',
};
DocPage.path = 'cloud-client-intro';

export default DocPage;
