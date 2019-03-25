import React from 'react';
import { Title, Body, Page, Link, Snippet } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Cloud Client Intro</Title>
      <Body>
        The <Link routeName="API-createCloudClient">cloud client</Link> provides
        an in-memory representation of a domain's data within a{' '}
        <Link routeName="Spec-Source">data source</Link>. The client allows you
        to observe and optimistically change data within the source.
      </Body>
      <Body>It requires a data source or a network source upon creation:</Body>
      <Snippet
        code={`
import createMemoryStorageSource from "@aven-cloud/cloud/createMemoryStorageSource";
import createCloudClient from "@aven-cloud/cloud/createCloudClient";

const source = createMemoryStorageSource({
  domain: 'mydomain',
});

const client = createCloudClient({
  source,
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
