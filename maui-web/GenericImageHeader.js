import React from 'react';
import { Image } from 'react-native';
import Container from '../dashboard-ui-deprecated/Container';

export default function GenericImageHeader() {
  return (
    <Container style={{ position: 'relative' }}>
      <Image
        source={require('./public/img/book-with-us.png')}
        style={{ flex: 1, paddingBottom: '20%', alignSelf: 'stretch' }}
      />
    </Container>
  );
}
