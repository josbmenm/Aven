import React from 'react';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import RequestCity from './RequestCity';

function RequestLocationPage() {
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
