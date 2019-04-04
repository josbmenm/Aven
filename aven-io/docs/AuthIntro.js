import React from 'react';
import {
  Title,
  Body,
  Page,
  Section,
  SubSection,
  List,
  ListItem,
  Link,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Authentication Intro</Title>
      <Body>
        Security can be added to a data source by wrapping it with an Auth
        Source before publishing the source over the network.
      </Body>
      <Body>
        On the client, the same sort of auth source can be used to optimistcally
        predict authentication failures, or to ensure permissions of client
        data..
      </Body>
      <SubSection title="Authentication">
        <Body>
          The first goal is authentication, to identify the user. A protected
          source can be created with several authentication providers. So far,
          we have built the following:
        </Body>
        <List>
          <ListItem>Email Auth Provider</ListItem>
          <ListItem>SMS Auth Provider</ListItem>
          <ListItem>Root Password</ListItem>
        </List>
        <Body>
          You can create your own authentication mechanisms (or help us
          implement missing ones like password and OAuth), by creating a custom{' '}
          <Link routeName="Spec-AuthProvider">Auth Provider</Link>
        </Body>
      </SubSection>
      <SubSection title="Permissions">
        <Body>
          Once a user is authenticated, you can apply permissions to grant or
          limit access. By default, no access is granted to docs, other than the
          docs owned by a user.
        </Body>
      </SubSection>
      <Section title="Protected Source API">
        <Body>
          The{' '}
          <Link routeName="Spec-ProtectedSource">
            API of a Protected Source
          </Link>{' '}
          is nearly identical to a Source. All actions can be passed with an
          'auth' object alongside. Without correct authentication, the Protected
          Source will block most or all of the Source actions. Additional
          actions are provided to authenticate and set doc permissions.
        </Body>
        <Body>
          Subscription is also augmented to support authentication.. when
          subscribing, the auth source requires an additional 3rd auth argument.
          The permissions will be checked to ensure that a client can only
          subscribe to docs they are allowed to read.
        </Body>
        <Body>
          Network Sources are responsible for proxying the Protected Source API
          as well as the Source API
        </Body>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Authentication Intro',
};
DocPage.path = 'auth-overview';

export default DocPage;
