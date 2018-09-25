import React from 'react';
import { AppRegistry } from 'react-native';

// import { createBrowserApp } from '../react-navigation-web';

export default function Client(App) {
  // const AppWithNavigation = createBrowserApp(App);

  // AppRegistry.registerComponent('App', () => AppWithNavigation);
  AppRegistry.registerComponent('App', () => App);

  AppRegistry.runApplication('App', {
    initialProps: { env: 'browser' },
    rootTag: document.getElementById('root'),
  });
}
