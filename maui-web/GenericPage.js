import React from 'react';
import { View } from 'react-native-web';
import MainMenu from './MainMenu';

export default ({ children }) => (
  <View style={{ width: '100%', overflowX: 'hidden' }}>
    <MainMenu />
    {children}
  </View>
);
