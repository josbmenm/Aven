import React from 'react';
import {
  Title,
  Body,
  Page,
  ListItem,
  Link,
  List,
  Bold,
  Snippet,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - createProtectedSource</Title>
      <Body>
        Create a source that is safe to publish over the network. The resulting
        object conforms to the{' '}
        <Link routeName="Spec-ProtectedSource">Protected Source API</Link>. This
        source provides:
      </Body>
      <List>
        <ListItem>
          <Bold>authentication</Bold> - identity verification and sessions
        </ListItem>
        <ListItem>
          <Bold>permissions</Bold> - intercepts disallowed actions on docs,
          according to a configuration
        </ListItem>
      </List>
      <Body>
        A protected source can be created as follows. For authentication, you
        must provide at least one auth provider, which is used to identify the
        user.
      </Body>
      <Snippet
        code={`
    const rootPasswordHash = await hashSecureString(password);
    const rootProvider = RootAuthProvider({
      rootPasswordHash,
    });

    const protectedSource = createProtectedSource({
      source,
      providers: [rootProvider],
    });
`}
      />
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - createProtectedSource',
};
DocPage.path = 'api-create-protected-source';

export default DocPage;
