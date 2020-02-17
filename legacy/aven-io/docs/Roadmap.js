import React from 'react';
import { Title, Body, Page, Section, List, ListItem } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Roadmap</Title>
      <Section title="Ideas">
        <List>
          <ListItem>TypeScript definitions, and porting code to TS</ListItem>
          <ListItem>
            synthetic data source: combine multiple data sources based on names
            and domains
          </ListItem>
          <ListItem>
            synthetic data source: migrate from one DS to another
          </ListItem>
          <ListItem>cache configuration of a DataSource</ListItem>
        </List>
      </Section>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Roadmap',
};
DocPage.path = 'roadmap';

export default DocPage;
