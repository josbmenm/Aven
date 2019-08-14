import React from 'react';
import { View } from 'react-native';
import Heading from '../dashboard/Heading';
import BodyText from '../dashboard/BodyText';
import Container from '../dashboard/Container';
import GenericPage from './GenericPage';
import GenericImageHeader from './GenericImageHeader';
import GenericHeroHeader from './GenericHeroHeader';
import SubscriptionForm from './SubscriptionForm';
import PageFooter from './PageFooter';
import { useTheme } from '../dashboard/Theme';

function SubscribePage() {
  const theme = useTheme();
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
