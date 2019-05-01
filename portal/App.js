import { View, Text, Button } from 'react-native';
import React from 'react';
import codePush from 'react-native-code-push';

import { createAppContainer } from '../navigation-native';
import { createStackNavigator } from '../navigation-stack';

function Home({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text>Home Page</Text>
      <Button
        title="Go To Profile"
        onPress={() => {
          navigation.navigate('Profile', { name: 'Lucy' });
        }}
      />
    </View>
  );
}

function Profile({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text>{navigation.getParam('name')}'s Profile</Text>
      <Button
        title="Go Back"
        onPress={() => {
          navigation.goBack();
        }}
      />
    </View>
  );
}
const AppNavigator = createStackNavigator(
  { Home, Profile },
  { headerMode: 'none' },
);
const App = createAppContainer(AppNavigator);

const AutoUpdatingApp = codePush(codePushOptions)(App);

export default AutoUpdatingApp;
