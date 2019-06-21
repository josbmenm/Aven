import React from 'react';
import { useTheme } from './ThemeContext';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import GenericHeroHeader from './GenericHeroHeader';
import BookUsWizard from './BookUsWizard';

function BookUsPage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <GenericHeroHeader
        backgroundColor={theme.colors.lightGrey}
      />
      <BookUsWizard />
      <PageFooter />
    </GenericPage>
  );
}

BookUsPage.navigationOptions = {
  title: 'Book with Us',
};

export default BookUsPage;
