import React from 'react';
import { View } from 'react-native';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader'
import PageFooter from './PageFooter';
import { useTheme } from '../dashboard/Theme'

function SubscribePage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1, paddingBottom: 40 }}>
        <GenericHeroHeader
          backgroundColor={theme.colors.lightGrey}
          title="Subscribe"
          bodyText="WIP"
        />
      </View>
      <PageFooter />
    </GenericPage>
  );
}

SubscribePage.navigationOptions = {
  title: 'Subscribe',
};

export default SubscribePage;
