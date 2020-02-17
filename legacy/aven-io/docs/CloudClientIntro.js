import React from 'react';
import {
  Title,
  Body,
  Page,
  Link,
  Snippet,
  Section,
  SubSection,
  ListItem,
  List,
} from '../DocViews';

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
      <SubSection title="Getting Docs">
        <Body>You can call `.get` on a client to access docs within it:</Body>
        <Snippet
          code={`const foo = cloud.get('foo');

// Access the doc named "bar" under the parent doc "foo":
const fooBar = cloud.get('foo/bar');`}
        />
        <Body>You can also call `.get` on the doc, to access a child:</Body>
        <Snippet
          code={`const alsoFooBar = foo.get('foo');
// fooBar === alsoFooBar`}
        />
      </SubSection>
      <Section title="API">
        <List>
          <ListItem>
            <Link routeName="API-createCloudClient">Cloud Client</Link> - The
            entry point for the client API
          </ListItem>
          <ListItem>
            <Link routeName="API-CloudDoc">Cloud Doc</Link> - The mutable
            client-side entity
          </ListItem>
          <ListItem>
            <Link routeName="API-CloudBlock">Cloud Block</Link> - The immutable
            client-side entity
          </ListItem>
          <ListItem>
            <Link routeName="API-CloudValue">Cloud Values</Link> - Additional
            methods available on Docs and Clients
          </ListItem>
        </List>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Cloud Client Intro',
};
DocPage.path = 'cloud-client-intro';

export default DocPage;
