import React from 'react';
import { ScrollView, StyleSheet, View, Text, Button } from 'react-native';
import { Ionicons } from '../react-navigation-icons';

import { createSwitchNavigator } from '../react-navigation-core';
import { createStackNavigator } from '../react-navigation-stack';
import { createBottomTabNavigator } from '../react-navigation-tabs';

const getTabBarLabel = routeName => {
  switch (routeName) {
    case 'OverviewTab':
      return 'Reference';
    case 'HomeTab':
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
        <ScrollView
          style={{
            backgroundColor: 'white',
            flex: 1,
            borderWidth: 10,
            borderColor: color,
          }}
          contentContainerStyle={{
            justifyContent: 'center',
            minHeight: '100%',
          }}>
          <Text style={{ color, fontSize: 32, textAlign: 'center' }}>
            {opts.titleForParams
              ? opts.titleForParams(this.props.navigation.state.params)
              : name}
          </Text>
          {opts.links &&
            Object.keys(opts.links).map(linkName => (
              <View key={linkName} style={{ padding: 20 }}>
                <Button
                  title={linkName}
                  onPress={() => {
                    this.props.navigation.navigate(opts.links[linkName]);
                  }}
                />
              </View>
            ))}
        </ScrollView>
      );
    }
  }
  return GenericScreen;
};

export const Login = createGenericScreen('Login', '#3c3', {
  path: 'login',
  links: {
    Login: { routeName: 'Home' },
  },
});

export const Home = createGenericScreen('Welcome', '#cc3', {
  path: '',
  links: {
    'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
    'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
    'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
  },
});

export const Overview = createGenericScreen('Overview', '#c33', {
  path: 'overview',
  links: {
    'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
    'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
    'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
  },
});

export const Lesson = createGenericScreen('Lesson', '#33c', {
  titleForParams: ({ id }) => `Lesson ${id}`,
  links: {
    'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
    'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
    'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
  },
});
Lesson.path = 'lesson';

const LessonWithPushBug = createGenericScreen('Lesson', '#33c', {
  titleForParams: ({ id }) => `Lesson ${id}`,
  links: {
    'Lesson A': { routeName: 'Lesson', params: { id: 'A' } },
    'Lesson B': { routeName: 'Lesson', params: { id: 'B' } },
    'Lesson C': { routeName: 'Lesson', params: { id: 'C' } },
  },
});
Lesson.path = 'lesson';

export const Search = createGenericScreen('Search', '#3c3', {
  links: {
    'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
    'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
    'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
  },
});

const HomeTab = createStackNavigator({
  Home,
  Lesson,
});
HomeTab.path = '';

const OverviewTab = createStackNavigator({
  Overview,
  Lesson,
});
OverviewTab.path = 'overview';

const SearchTab = createStackNavigator({
  Search,
  Lesson,
});
SearchTab.path = 'search';

const SettingsTab = createStackNavigator({
  Settings: createGenericScreen('Settings', '#333', {
    links: {
      'Account Settings': 'AccountSettings',
      'Privacy Settings': 'PrivacySettings',
      'Notification Settings': 'NotifSettings',
      'Notification23 Settings': 'NotifSettings',
      'Notification3 Settings': 'NotifSettings',
      'Notificatio4n Settings': 'NotifSettings',
      'Notificati5on Settings': 'NotifSettings',
      'Notifi6cation Settings': 'NotifSettings',
      'Notifi7cation Settings': 'NotifSettings',
      'Notific6atsion Settings': 'NotifSettings',
      'Notifica8tion Settings': 'NotifSettings',
    },
  }),
  AccountSettings: createGenericScreen('Account Settings', '#3c3', {}),
  PrivacySettings: createGenericScreen('Privacy Settings', '#c33', {}),
  NotifSettings: createGenericScreen('Notif Settings', '#33c', {}),
});
SettingsTab.path = 'settings';

// const App = createStackNavigator({
// const App = createSwitchNavigator({
export const FullApp = createBottomTabNavigator(
  {
    HomeTab,
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

export const BasicSwitch = createSwitchNavigator({
  Login,
  Home,
});

export const BasicStack = createStackNavigator({
  Home,
  Lesson,
});

export const StackWithPushBug = createStackNavigator({
  Home,
  Lesson: LessonWithPushBug,
});

export const SwitchInStack = createSwitchNavigator({
  Login,
  Main: createStackNavigator({
    Home,
    Lesson,
  }),
});
