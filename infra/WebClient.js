import React from 'react';
import { AppRegistry } from 'react-native';

import { createBrowserApp } from '../react-navigation-web';

export default function Client(App) {
  const AppWithNavigation = createBrowserApp(App);

  AppRegistry.registerComponent('App', () => AppWithNavigation);

  AppRegistry.runApplication('App', {
    initialProps: {},
    rootTag: document.getElementById('root'),
  });
}
