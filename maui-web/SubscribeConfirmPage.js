import React from 'react';
import { View } from 'react-native';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader';
import PageFooter from './PageFooter';
import { useTheme } from '../dashboard-ui-deprecated/Theme';
import GenericImageHeader from './GenericImageHeader';

function SubscribeConfirmPage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1, paddingBottom: 40 }}>
        <GenericImageHeader />
        <GenericHeroHeader
          backgroundColor={theme.colors.lightGrey}
          title="thanks for subscribing!"
          bodyText="we will reach out soon."
        />
      </View>
      <PageFooter />
    </GenericPage>
  );
}

SubscribeConfirmPage.navigationOptions = {
  title: 'You are subscribed to updates',
};

export default SubscribeConfirmPage;
