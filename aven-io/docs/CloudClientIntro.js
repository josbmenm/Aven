import React from 'react';
import { Title, Body, Page, Link, Snippet, Section } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Cloud Client Intro</Title>
      <Body>
        The <Link routeName="API-createCloudClient">cloud client</Link> provides
        an in-memory representation of a domain's data within a{' '}
        <Link routeName="Spec-Source">source</Link>. The client helps you
        observe and optimistically change data within the source.
      </Body>
      <Body>It requires a source upon creation:</Body>
      <Snippet
        code={`
import createMemoryStorageSource from "@aven-cloud/cloud/createMemoryStorageSource";
import createCloudClient from "@aven-cloud/cloud/createCloudClient";

const source = createMemoryStorageSource({
  domain: 'mydomain',
});

const cloud = createCloudClient({
  source,
  domain: 'mydomain',
});
`}
      />
      <Body>
        Because the client is the primary interface to our storage, we tend call
        it "cloud"
      </Body>
      <Section title="Getting Docs">
        <Body>You can call `.get` on a client to access docs within it:</Body>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Cloud Client Intro',
};
DocPage.path = 'cloud-client-intro';

export default DocPage;
