import React from 'react';
import { Title, Body, Page, Link, SubSection, Section } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Spec - AuthDataSource</Title>
      <Body>
        A strict extension of{' '}
        <Link routeName="Spec-DataSource">the data source API</Link>. Used to
        provide network-safe access to the database.
      </Body>
      <Body>
        Generally an authenticated data source will be created by
        `createAuthDataSource`, but network sources can proxy an auth source on
        the server.
      </Body>
      <Section title="Additional Actions">
        <Body>
          In addition to the data source actions, the following actions will be
          supported for an auth data source.
        </Body>
        <SubSection title="PutDocPermissions">
          <Body>..</Body>
        </SubSection>
      </Section>
      <Section title="observeDoc(domain, name, auth)">
        <Body>
          An additional argument is available on observeDoc, which allows you to
          specify the authentication object for the subscription. If the
          authentication fails, observeDoc will asyncronously reject.
        </Body>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Spec - AuthDataSource',
};
DocPage.path = 'spec-auth-data-source';

export default DocPage;
