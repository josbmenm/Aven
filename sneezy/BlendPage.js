import React from 'react';
import { View } from 'react-native';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader'
import PageFooter from './PageFooter';
import { useTheme } from './ThemeContext';

function BlendPage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1, paddingBottom: 40 }}>
        <GenericHeroHeader
          backgroundColor={theme.colors.lightGrey}
          title="Blend"
          bodyText="WIP"
        />
      </View>
      <PageFooter />
    </GenericPage>
  );
}

BlendPage.navigationOptions = {
  title: 'Blend',
};

export default BlendPage;
