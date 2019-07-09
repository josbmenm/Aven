import React from 'react';
import { createSwitchNavigator } from '../navigation-core';
import MauiWebApp from '../maui-web/MauiWebApp';
import TokensPage from '../maui-web/TokensPage';
import EmailsPlayground from './EmailsPlayground';
// import getActiveChildNavigationOptions from '../navigation-core/utils/getActiveChildNavigationOptions';
import { theme } from '../maui-web/Theme';
import { ThemeProvider } from '../dashboard/Theme';

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

function Root(props) {
  return (
    <ThemeProvider value={theme}>
      <App {...props} />
    </ThemeProvider>
  );
}

Root.router = App.router;
Root.navigationOptions = App.navigationOptions;

export default Root;
