import React from 'react';
import { createSwitchNavigator } from '../navigation-core';
import MauiWebApp from '../maui-web/MauiWebApp';
import UILibrary from '../ui-library/UILibraryPage';
import EmailsPlayground from './EmailsPlayground';
// import getActiveChildNavigationOptions from '../navigation-core/utils/getActiveChildNavigationOptions';
import { ThemeProvider as OLDThemeProvider } from '../dashboard/Theme';
import OnoTheme from '../logic/OnoTheme';
import { ThemeProvider } from '../dash-ui/Theme';

const App = createSwitchNavigator(
  {
    MauiPreview: {
      path: 'maui-preview',
      screen: MauiWebApp,
    },
    UILibrary: {
      path: 'ui-library',
      screen: UILibrary,
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
    <OLDThemeProvider value={OnoTheme}>
      <ThemeProvider>
        <App {...props} />
      </ThemeProvider>
    </OLDThemeProvider>
  );
}

Root.router = App.router;
Root.navigationOptions = App.navigationOptions;

export default Root;
