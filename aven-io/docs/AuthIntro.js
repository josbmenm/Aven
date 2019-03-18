import React from 'react';
import { Title, Body, Page, Section } from '../DocViews';

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
      <Section title="Auth Source API">
        <Body>
          The API of an auth source is nearly identical to a data source. All
          actions can be passed with an 'auth' object alongside. Without correct
          authentication, the auth source will block most or all of the data
          source actions. Additional actions are provided to authenticate and
          set doc permissions.{' '}
        </Body>
        <Body>
          Subscription is also augmented to support authentication.. when
          subscribing, the auth source requires an additional auth argument, and
          the permissions will be checked to ensure that a client can only
          subscribe to docs they are allowed to get.
        </Body>
        <Body>
          Network sources are responsible for proxying the auth API as well as
          the data source API
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
