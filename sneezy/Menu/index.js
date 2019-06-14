import { TextInput, View, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { ThemeContext, theme } from '../ThemeContext'
import GenericPage from '../GenericPage';
import PageFooter from '../PageFooter';
import Header from './Header'
import BlendsList from './BlendsList'

function Menu() {
  return (
    <ThemeContext.Provider value={theme}>
      <Header />
      <BlendsList />
      <PageFooter />
    </ThemeContext.Provider>
  );
}

function MenuPage() {
  return (
    <GenericPage>
      <Menu />
    </GenericPage>
  );
}

MenuPage.navigationOptions = {
  title: 'Our Blends',
};

export default MenuPage;
