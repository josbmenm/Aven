import React from 'react';
import { ScrollView, StyleSheet, View, Text, Button } from 'react-native';
import { Transitioner } from '../react-navigation-transitioner';

const Main = () => (
  <View>
    <Text>Hello people!</Text>
  </View>
);

Main.navigationOptions = {
  title: 'Globe Playground',
};

const App = Transitioner({
  Main,
});

export default App;
