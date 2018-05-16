import React from 'react';
import { AppRegistry } from 'react-native';

import { createBrowserApp } from './react-navigation-web';

import AppWeb from './AppWeb';

const App = createBrowserApp(AppWeb);

AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});

if (module.hot) {
  module.hot.accept();
}
