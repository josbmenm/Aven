import React from 'react';
import { Title, Body, Page, Link, SubSection, Section } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Spec - ProtectedSource</Title>
      <Body>
        A strict extension of{' '}
        <Link routeName="Spec-Source">the data source API</Link>. Used to
        provide network-safe access to the database.
      </Body>
      <Body>
        Generally an authenticated data source will be created by
        `createProtectedSource`, but network sources can proxy an auth source on
        the server.
      </Body>
      <Section title="Auth Actions">
        <Body>
          In addition to the <Link routeName="Spec-Source">Source actions</Link>
          , the following actions will be supported for a protected source.
        </Body>
        <SubSection title="PutPermissionRules">
          <Body>
            Configure permissions of reading/writing/administrating a doc within
            a domain.
          </Body>
        </SubSection>
        <SubSection title="CreateSession">
          <Body>Creates a session using the authentication providers</Body>
        </SubSection>
        <SubSection title="CreateAnonymousSession">
          <Body>
            Takes a domain and creates a session for an anonymous user.
          </Body>
        </SubSection>

        <SubSection title="DestroySession">
          <Body>Log out of a session.</Body>
        </SubSection>

        <SubSection title="VerifySession">
          <Body>Validates a session object.</Body>
        </SubSection>

        <SubSection title="VerifyAuth">
          <Body>
            Takes a domain and an auth object, and validates the authentication.
            Either by verifying the session, or by performing a step in the
            authentcation process.
          </Body>
        </SubSection>

        <SubSection title="SetAccountName">
          <Body>
            This feature is not yet tested/complete, but it is meant to allow a
            user to change their username.
          </Body>
        </SubSection>

        <SubSection title="PutAuthProvider">
          <Body>
            Allows an anonymous or authenticated user to add or set an
            authentication provider for their account. May be used by an
            anonymous user to add an email address, for example. This feature is
            not yet tested/complete.
          </Body>
        </SubSection>
      </Section>
      <SubSection title="observeDoc(domain, name, auth)">
        <Body>
          An additional argument is available on observeDoc, which allows you to
          specify the authentication object for the subscription. If the
          authentication fails, observeDoc will asyncronously reject.
        </Body>
      </SubSection>
      <SubSection title="observeDocChildren(domain, name, auth)">
        <Body>Auth-safe interface for observeDocChildren.</Body>
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Spec - ProtectedSource',
};
DocPage.path = 'spec-protected-source';

export default DocPage;
