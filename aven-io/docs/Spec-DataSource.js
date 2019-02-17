import React from 'react';
import { Title, Body, Page } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Spec - DataSource</Title>
      <Body>
        Data Sources are used as a generic interface for reading, observing, and
        saving data. It is usually backed by a database like PostgreSQL or the
        file system. Data sources are often made from other Data Sources- for
        example the client will use a network Data Source which connects to a
        Data Source on the server.
      </Body>
      <Body>
        A Data Source can be any object which conforms to this protocol:
      </Body>
      <Body>- main API {'\n'}- actions API</Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Spec - DataSource',
};
DocPage.path = 'spec-data-source';

export default DocPage;
