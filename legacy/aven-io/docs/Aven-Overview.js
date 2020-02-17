import React from 'react';
import { Title, Body, Page } from '../DocViews';
import { useNavigation } from '../../navigation-hooks/Hooks';

function DocPage() {
  const { getParam } = useNavigation();
  return (
    <Page>
      <Title>Aven Overview</Title>
    </Page>
  );
}

DocPage.navigationOptions = {
  title: 'Aven Docs Home',
};
DocPage.path = '';

export default DocPage;
