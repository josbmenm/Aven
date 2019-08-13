import React from 'react';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import BookUsWizard from './BookUsWizard';
import GenericImageHeader from './GenericImageHeader';

function BookUsPage() {
  return (
    <GenericPage>
      <GenericImageHeader />
      <BookUsWizard />
      <PageFooter />
    </GenericPage>
  );
}

BookUsPage.navigationOptions = {
  title: 'Book with Us',
};

export default BookUsPage;
