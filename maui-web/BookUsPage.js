import React from 'react';
import { Image } from 'react-native';
import { useTheme } from '../dashboard/Theme';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import Container from '../dashboard/Container';
import BookUsWizard from './BookUsWizard';

function BookUsPage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <Container style={{ position: 'relative' }}>
        <Image
          source={require('./public/img/book-with-us.png')}
          style={{ flex: 1, paddingBottom: '20%', alignSelf: 'stretch' }}
        />
      </Container>

      <BookUsWizard />
      <PageFooter />
    </GenericPage>
  );
}

BookUsPage.navigationOptions = {
  title: 'Book with Us',
};

export default BookUsPage;
