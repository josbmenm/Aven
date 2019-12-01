import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Doc Permissions</Title>
      <Body>
        Restrict access to docs (and linked blocks), according to the
        authenticated user.
      </Body>
      <Body>
        A given request may be unauthenticated, anonymously authenticated, or
        authenticated via a provider.
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'DocPermissions',
};
DocPage.path = 'doc-permissions';

export default DocPage;
