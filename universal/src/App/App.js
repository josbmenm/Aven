import React from 'react';

import {
  Login,
  Home,
  Overview,
  Lesson,
  Settings,
  AccountSettings,
  PrivacySettings,
  NotifSettings,
} from '../App/TestScreens';

import { createSwitchNavigator } from '../react-navigation-core';
import { createFluidNavigator } from '../react-navigation-fluid';
import { createStackNavigator } from '../react-navigation-stack';
import { createBottomTabNavigator } from '../react-navigation-tabs';

import { getTabBarLabel, getTabBarIcon } from '../App/tabBarConfig';

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

const SettingsTab = createStackNavigator({
  Settings,
  AccountSettings,
  PrivacySettings,
  NotifSettings,
});
SettingsTab.path = 'settings';

export const StacksInTabs = createBottomTabNavigator(
  {
    HomeTab,
    OverviewTab,
    SettingsTab,
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarLabel: getTabBarLabel(navigation.state.routeName),
      tabBarIcon: getTabBarIcon(navigation.state.routeName),
    }),
  },
);

export const App = createSwitchNavigator({
  // LoginRoute: createLogin({}),
  Login,
  Main: StacksInTabs,
});

export default App;
