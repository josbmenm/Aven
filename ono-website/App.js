import React from 'react';
import { ScrollView, StyleSheet, View, Text, Button } from 'react-native';
import { createSwitchNavigator } from '../react-navigation-core';

const Main = () => (
  <View>
    <Text>ono!</Text>
  </View>
);

const App = createSwitchNavigator({
  Main,
});

export default App;
