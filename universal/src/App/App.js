import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { createSwitchNavigator } from '../react-navigation-core';
import { createStackNavigator } from '../react-navigation-stack';
import { createBottomTabNavigator } from '../react-navigation-tabs';

class ScreenA extends React.Component {
  static navigationOptions = {
    headerTitle: 'ScreenA',
  };
  render() {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>Hello, screen A!</Text>
        <Button
          onPress={() => {
            this.props.navigation.navigate('ScreenB');
          }}
          title="Go Screen B"
        />
      </View>
    );
  }
}

class ScreenB extends React.Component {
  static navigationOptions = {
    headerTitle: 'ScreenB',
  };
  render() {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>Hello, screen B!</Text>
        <Button
          onPress={() => {
            this.props.navigation.navigate('ScreenA');
          }}
          title="Go Back"
        />
      </View>
    );
  }
}

const createGenericScreen = (name, color, opts) => {
  class GenericScreen extends React.Component {
    render() {
      return (
        <View style={{ flex: 1, borderWidth: 10, borderColor: color }}>
          <Text style={{ color, fontSize: 24, textAlign: 'center' }}>
            {name}
          </Text>
        </View>
      );
    }
  }
  return GenericScreen;
};

const Lesson = createGenericScreen('Lesson', 'blue', {});

const WalkthroughTab = createStackNavigator({
  Walkthrough: createGenericScreen('Walkthrough', '#3cc', {}),
  Lesson,
});

const OverviewTab = createStackNavigator({
  Search: createGenericScreen('Overview', '#33c', {}),
  Lesson,
});

const SearchTab = createStackNavigator({
  Search: createGenericScreen('Search', '#3c3', {}),
  Lesson,
});

const SettingsTab = createStackNavigator({
  Settings: createGenericScreen('Settings', '#333', {
    links: ['AccountSettings', 'PrivacySettings', 'NotifSettings'],
  }),
  AccountSettings: createGenericScreen('AccountSettings', '#3c3', {}),
  PrivacySettings: createGenericScreen('PrivacySettings', '#c33', {}),
  NotifSettings: createGenericScreen('NotifSettings', '#33c', {}),
});

// const App = createStackNavigator({
// const App = createSwitchNavigator({
const App = createBottomTabNavigator(
  {
    WalkthroughTab,
    OverviewTab,
    SearchTab,
    SettingsTab,
  },
  {
    navigationOptions: {
      tabBarIcon: (
        <Ionicons name="md-checkmark-circle" size={32} color="green" />
      ),
    },
  },
);

export default App;

const styles = StyleSheet.create({
  box: {
    padding: 10,
    borderWidth: 3,
    borderColor: 'blue',
    flex: 1,
  },
  text: { fontWeight: 'bold' },
});
