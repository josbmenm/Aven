import React from 'react';
import { Title, Body, Page, Link } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Garbage Collection</Title>
      <Body>
        <Link url="https://github.com/AvenCloud/Aven/issues/6">
          Coming Soon.
        </Link>
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Garbage Collection',
};
DocPage.path = 'garbage-collection';

export default DocPage;
