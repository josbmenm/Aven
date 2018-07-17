import React from 'react';
import { Ionicons } from '../react-navigation-icons';

export const getTabBarLabel = routeName => {
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
    case 'HomeTab':
      return 'ios-walk';
    case 'SearchTab':
      return 'ios-search';
    default:
      return 'ios-settings';
  }
};
export const getTabBarIcon = routeName => ({ tintColor, focused }) => (
  <Ionicons
    name={`${getIoniconForRoute(routeName)}${focused ? '' : '-outline'}`}
    size={32}
    color={tintColor}
  />
);
