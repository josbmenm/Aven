import { TextInput, View, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import GenericPage from '../GenericPage';
import HeroHeader from './HeroHeader'
import MainMenu from '../MainMenu';

function Home({}) {
  return (
    <React.Fragment>
      <MainMenu />
      <HeroHeader />
    </React.Fragment>
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
