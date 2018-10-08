import React from 'react';

// this will actually resolve to react-native-web... *eyeroll*
import { AppRegistry } from 'react-native';

// import { createBrowserApp } from '../react-navigation-web';

export default function startWebClient(App) {
  // const AppWithNavigation = createBrowserApp(App);

  AppRegistry.registerComponent('App', () => App);

  AppRegistry.runApplication('App', {
    initialProps: {
      env: 'browser',
    },
    rootTag: document.getElementById('root'),
  });
}
