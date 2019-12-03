import React from 'react';
import {
  Title,
  Body,
  Page,
  Link,
  Section,
  SubSection,
  Snippet,
} from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Observables with Cloud and React</Title>
      <Body>
        Aven Cloud uses{' '}
        <Link url="https://github.com/staltz/xstream">xstream</Link> under the
        hood, which enables you to use a standard pattern for observing data in
        your database.
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Observables',
};
DocPage.path = 'observable-usage';

export default DocPage;
