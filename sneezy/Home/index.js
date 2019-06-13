import { TextInput, View, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import GenericPage from '../GenericPage';
import HeroHeader from './HeroHeader'
import { ThemeContext, theme } from '../ThemeContext'
import PageFooter from '../PageFooter';

function Home({}) {
  return (
    <ThemeContext.Provider value={theme}>
      <HeroHeader />
      <PageFooter />
    </ThemeContext.Provider>
  );
}

function HomePage() {
  return (
    <GenericPage>
      <Home />
    </GenericPage>
  );
}

HomePage.navigationOptions = {
  title: 'Home',
};

export default HomePage;
