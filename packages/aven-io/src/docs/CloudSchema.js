import React from 'react';
import { Title, Body, Page, Link } from '../DocViews';

function DocPage() {
  return (
    <Page>
      <Title>Schemas</Title>
      <Body>
        <Link url="https://github.com/AvenCloud/Aven/issues/4">
          Coming Soon.
        </Link>
      </Body>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Schemas',
};
DocPage.path = 'cloud-schema';

export default DocPage;
