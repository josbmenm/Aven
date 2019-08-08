import React from 'react';
import { useTheme } from '../dashboard/Theme';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import GenericHeroHeader from './GenericHeroHeader';
import RequestCity from './RequestCity';

function RequestLocationPage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <RequestCity style={{ marginVertical: 80 }} />
      <PageFooter />
    </GenericPage>
  );
}

RequestLocationPage.navigationOptions = {
  title: 'Request Location',
};

export default RequestLocationPage;
