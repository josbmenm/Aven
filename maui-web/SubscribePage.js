import React from 'react';
import { View } from 'react-native';
import Heading from '../dashboard-ui-deprecated/Heading';
import BodyText from '../dashboard-ui-deprecated/BodyText';
import Container from '../dashboard-ui-deprecated/Container';
import GenericPage from './GenericPage';
import GenericImageHeader from './GenericImageHeader';
import SubscriptionForm from './SubscriptionForm';
import PageFooter from './PageFooter';

function SubscribePage() {
  return (
    <GenericPage>
      <View style={{ flex: 1, paddingBottom: 40 }}>
        <GenericImageHeader />
        <Heading
          size="large"
          style={{ textAlign: 'center', marginVertical: 16, marginTop: 32 }}
        >
          Subscribe to updates
        </Heading>
        <Container responsiveStyle={{ marginBottom: [32, 64] }}>
          <BodyText style={{ textAlign: 'center', marginVertical: 16 }}>
            Looking for Ono Blends in LA? Sign up for our occasional email
            announcements.
          </BodyText>
        </Container>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <SubscriptionForm />
        </View>
      </View>
      <PageFooter />
    </GenericPage>
  );
}

SubscribePage.navigationOptions = {
  title: 'Subscribe',
};

export default SubscribePage;
