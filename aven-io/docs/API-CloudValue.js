import React from 'react';
import {
  Title,
  Body,
  Page,
  Link,
  List,
  ListItem,
  Section,
  SubSection,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>API - Cloud Value</Title>
      <Body>A cloud value may be one of the following:</Body>
      <List>
        <ListItem>
          <Link routeName="API-CloudDoc">doc</Link> (value that changes)
        </ListItem>
        <ListItem>
          <Link routeName="API-CloudBlock">block</Link> (staic value which may
          be loaded asyncronously)
        </ListItem>
        <ListItem>A value derived from blocks and docs.</ListItem>
      </List>
      <Section title="Methods">
        <SubSection title="Map">
          <Body>Hello hello</Body>
        </SubSection>
        <SubSection title="Expand">
          <Body>Hello hello</Body>
        </SubSection>
        <SubSection title="Eval">
          <Body>Hello hello</Body>
        </SubSection>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'API - Cloud Value',
};
DocPage.path = 'api-cloud-value';

export default DocPage;
