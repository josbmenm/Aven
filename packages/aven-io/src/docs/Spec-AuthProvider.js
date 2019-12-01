import React from 'react';
import { Title, Body, Page, SubSection, List, ListItem } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Spec - AuthProvider</Title>
      <Body>
        This is an object that a protected source can use to identify a user.
      </Body>
      <SubSection title="API">
        <Body>The provider is an object with the following:</Body>
        <List>
          <ListItem>name - a label for the provider</ListItem>
          <ListItem>
            canVerify(verificationInfo) - return true or false if this info is
            sufficient to id the user via this provider
          </ListItem>
          <ListItem
            children={`async requestVerification({
    verificationInfo,
    providerState,
    accountId,
  })`}
          />
          <ListItem
            children={`async performVerification({(providerState, verificationResponse)})`}
          />
          <ListItem>async getProviderId(verificationInfo)</ListItem>
        </List>
      </SubSection>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Spec - AuthProvider',
};
DocPage.path = 'spec-auth-provider';

export default DocPage;
