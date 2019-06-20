import React from 'react';
import { View } from 'react-native';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader'
import PageFooter from './PageFooter';
import { useTheme } from './ThemeContext';

function SchedulePage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1, paddingBottom: 40 }}>
        <GenericHeroHeader
          backgroundColor={theme.colors.lightGrey}
          title="Schedule"
          bodyText="WIP"
        />
      </View>
      <PageFooter />
    </GenericPage>
  );
}

SchedulePage.navigationOptions = {
  title: 'Schedule',
};

export default SchedulePage;