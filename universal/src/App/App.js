import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { Ionicons } from '../react-navigation-icons';

import { createSwitchNavigator } from '../react-navigation-core';
import { createStackNavigator } from '../react-navigation-stack';
import { createBottomTabNavigator } from '../react-navigation-tabs';

const getTabBarLabel = routeName => {
  switch (routeName) {
    case 'OverviewTab':
      return 'Reference';
    case 'WalkthroughTab':
      return 'Tutorial';
    case 'SearchTab':
      return 'Search';
    case 'SettingsTab':
      return 'Settings';
    default:
      return 'Settings';
  }
};
const getIoniconForRoute = routeName => {
  switch (routeName) {
    case 'OverviewTab':
      return 'ios-archive';
    case 'WalkthroughTab':
      return 'ios-walk';
    case 'SearchTab':
      return 'ios-search';
    default:
      return 'ios-settings';
  }
};
const getTabBarIcon = routeName => ({ tintColor, focused }) => (
  <Ionicons
    name={`${getIoniconForRoute(routeName)}${focused ? '' : '-outline'}`}
    size={32}
    color={tintColor}
  />
);

const createGenericScreen = (name, color, opts) => {
  class GenericScreen extends React.Component {
    static path = opts.path;
    static navigationOptions = ({ navigation }) => ({
      headerTitle: opts.titleForParams
        ? opts.titleForParams(navigation.state.params)
        : name,
    });
    render() {
      return (
        <View
          style={{
            flex: 1,
            borderWidth: 10,
            borderColor: color,
            justifyContent: 'center',
          }}>
          <Text style={{ color, fontSize: 24, textAlign: 'center' }}>
            {name}
          </Text>
          {opts.links &&
            Object.keys(opts.links).map(linkName => (
              <View style={{ padding: 20 }}>
                <Button
                  key={linkName}
                  title={linkName}
                  onPress={() => {
                    this.props.navigation.navigate(opts.links[linkName]);
                  }}
                />
              </View>
            ))}
        </View>
      );
    }
  }
  return GenericScreen;
};

const Lesson = createGenericScreen('Lesson', 'blue', {
  titleForParams: ({ id }) => `Lesson ${id}`,
  links: {
    'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
    'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
    'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
  },
});
Lesson.path = 'lesson';

const WalkthroughTab = createStackNavigator({
  Walkthrough: createGenericScreen('Walkthrough', '#3cc', {
    path: '',
    links: {
      'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
      'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
      'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
    },
  }),
  Lesson,
});
WalkthroughTab.path = '';

const OverviewTab = createStackNavigator({
  Overview: createGenericScreen('Overview', '#33c', {
    path: '',
    links: {
      'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
      'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
      'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
    },
  }),
  Lesson,
});
OverviewTab.path = 'overview';

const SearchTab = createStackNavigator({
  Search: createGenericScreen('Search', '#3c3', {
    links: {
      'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
      'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
      'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
    },
  }),
  Lesson,
});
SearchTab.path = 'search';

const SettingsTab = createStackNavigator({
  Settings: createGenericScreen('Settings', '#333', {
    links: {
      'Account Settings': 'AccountSettings',
      'Privacy Settings': 'PrivacySettings',
      'Notification Settings': 'NotifSettings',
    },
  }),
  AccountSettings: createGenericScreen('Account Settings', '#3c3', {}),
  PrivacySettings: createGenericScreen('Privacy Settings', '#c33', {}),
  NotifSettings: createGenericScreen('Notif Settings', '#33c', {}),
});
SettingsTab.path = 'settings';

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
    navigationOptions: ({ navigation }) => ({
      tabBarLabel: getTabBarLabel(navigation.state.routeName),
      tabBarIcon: getTabBarIcon(navigation.state.routeName),
    }),
  },
);

export default App;
