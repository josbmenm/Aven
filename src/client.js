import React from 'react';
import { AppRegistry } from 'react-native';

import { createBrowserApp } from './react-navigation-web';

//ReplaceStart

import App from './WebsiteExample';

//ReplaceEnd

const AppWithNavigation = createBrowserApp(App);

AppRegistry.registerComponent('App', () => AppWithNavigation);

AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});

if (module.hot) {
  module.hot.accept();
}
