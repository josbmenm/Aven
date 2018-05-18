import React from 'react';
import { createSwitchNavigator } from '../react-navigation-core';
import { createFluidNavigator } from '../react-navigation-fluid';
import { createStackNavigator } from '../react-navigation-stack';
import { createBottomTabNavigator } from '../react-navigation-tabs';
import { createLogin } from '../sassy-login';
import { getTabBarLabel, getTabBarIcon } from '../App/tabBarConfig';
import {
  Login,
  Overview,
  Settings,
  AccountSettings,
  PrivacySettings,
  NotifSettings,
} from '../App/TestScreens';
import { Home, Lesson } from '../App/RealScreens';

const HomeTab = createFluidNavigator({
  Home,
  Lesson,
});
HomeTab.path = '';

const OverviewTab = createStackNavigator({
  Overview,
  Lesson,
});

const SettingsTab = createStackNavigator({
  Settings,
  AccountSettings,
  PrivacySettings,
  NotifSettings,
});

export const Main = createBottomTabNavigator(
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

const App = createSwitchNavigator({
  Login: createLogin({}),
  Main,
});

export default App;
