import React from 'react';
import { AppRegistry } from 'react-native';

import AppNavigator from './App';
import { createNavigationContainer } from './react-navigation-native-container';

const AppContainer = createNavigationContainer(AppNavigator);

const App = () => <AppContainer />;

AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});

if (module.hot) {
  module.hot.accept();
}
