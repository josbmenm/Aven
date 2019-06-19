import React from 'react';
import { View } from 'react-native';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader'
import BlendsList from './BlendsList';
import PageFooter from './PageFooter';
import { useTheme } from './ThemeContext';

function Menu() {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1, paddingBottom: 38 }}>
        <GenericHeroHeader
          backgroundColor={theme.colors.lightGrey}
          title="Our Blends"
          bodyText="All of our blends are designed thoughfully to provide you. with a
        healthy, balanced, and nutritious meal. All our drinks are made with
        100% organic ingredients, and are guaranteed to make you feel great."
        />
      </View>
      <BlendsList />
      <PageFooter />
    </GenericPage>
  );
}

Menu.navigationOptions = {
  title: 'Our Blends',
};

export default Menu;
