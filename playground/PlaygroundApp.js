import React from 'react';
import { createSwitchNavigator } from '../navigation-core';
import MauiWebApp from '../maui-web/MauiWebApp';
import TokensPage from '../maui-web/TokensPage';
import EmailsPlayground from './EmailsPlayground';
import getActiveChildNavigationOptions from '../navigation-core/utils/getActiveChildNavigationOptions';

const App = createSwitchNavigator(
  {
    MauiPreview: {
      path: 'maui-preview',
      screen: MauiWebApp,
      // navigationOptions: ({ navigation, screenProps }) =>
      //   getActiveChildNavigationOptions(navigation, screenProps),
    },
    Tokens: {
      path: 'design-tokens',
      screen: TokensPage,
    },
    EmailsPlayground: {
      path: 'emails',
      screen: EmailsPlayground,
    },
  },
  {
    // defaultNavigationOptions: {},
  },
);

export default App;
