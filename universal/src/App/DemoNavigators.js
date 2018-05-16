import React from 'react';

import {
  Login,
  Home,
  Overview,
  Lesson,
  LessonWithPushBug2,
  LessonWithPushBug,
  Settings,
  AccountSettings,
  PrivacySettings,
  NotifSettings,
} from '../App/TestScreens';

import { createSwitchNavigator } from '../react-navigation-core';
import { createStackNavigator } from '../react-navigation-stack';
import { createBottomTabNavigator } from '../react-navigation-tabs';

import { getTabBarLabel, getTabBarIcon } from '../App/tabBarConfig';

const HomeTab = createStackNavigator({
  Home: Home,
  Lesson: Lesson,
});

const OverviewTab = createStackNavigator({
  Overview: Overview,
  Lesson: Lesson,
});

const SettingsTab = createStackNavigator({
  Settings,
  AccountSettings,
  PrivacySettings,
  NotifSettings,
});

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

export const StackWithPushBug2 = createStackNavigator({
  Home,
  Lesson: LessonWithPushBug2,
});

export const StackInSwitch = createSwitchNavigator({
  Login,
  Main: createStackNavigator({
    Home,
    Lesson,
  }),
});

export const FullApp = createSwitchNavigator({
  Login,
  Main: StacksInTabs,
});
