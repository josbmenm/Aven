import React from 'react';
import { useTheme } from './ThemeContext';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import GenericHeroHeader from './GenericHeroHeader';

function BookUsPage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <GenericHeroHeader
        backgroundColor={theme.colors.lightGrey}
        title="Book with Us"
        bodyText="Are you interested in having Ono Blends cater for an event? We’d love to! All we need from you are a few details about your event, so we can provide you with the best experience possible."
      />
      <PageFooter />
    </GenericPage>
  );
}

BookUsPage.navigationOptions = {
  title: 'Book with Us',
};

export default BookUsPage;