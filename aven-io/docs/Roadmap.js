import React from 'react';
import { Title, Body, Page, Section, List, ListItem } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Roadmap</Title>
      <Section title="Ideas">
        <List>
          <ListItem>
            synthetic data source: combine multiple data sources based on names
            and domains
          </ListItem>
          <ListItem>
            synthetic data source: migrate from one DS to another
          </ListItem>
          <ListItem>cache configuration of a DataSource</ListItem>
          <ListItem>switch from sha1 to better hash algo</ListItem>
          <ListItem>switch from uuid/v1 to better id like KUID</ListItem>
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
