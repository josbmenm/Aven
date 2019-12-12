import React from 'react';
import createFullscreenSwitchNavigator from '../navigation-web/createFullscreenSwitchNavigator';

import OnoTheme from '../logic/OnoTheme';
import { ThemeProvider } from '../dashboard/Theme';
import { CloudContext } from '../cloud-core/KiteReact';

import Buttons from './Buttons';
import Inputs from './Inputs';

import Heading from '../dashboard/Heading';
import View from '../views/View';
import { Layout } from './Layout';

const customHTMLHeaders = `
<meta name="viewport" content="width=device-width, initial-scale=1" />
`;

function Home() {
  return (
    <Layout>
      <Heading>UI Library Home test</Heading>
    </Layout>
  );
}

export const LibraryRoutes = {
  Home: {
    path: '',
    screen: Home,
  },
  Buttons: {
    path: 'buttons',
    screen: Buttons,
  },
  Inputs: {
    path: 'inputs',
    screen: Inputs,
  },
};

const LibraryNavigator = createFullscreenSwitchNavigator(LibraryRoutes, {
  defaultNavigationOptions: {
    customHTMLHeaders,
  },
});

function UILibraryPage(props) {
  const cloud = React.useContext(CloudContext);
  return (
    <ThemeProvider value={OnoTheme}>
      <LibraryNavigator {...props} screenProps={{ cloud }} />
    </ThemeProvider>
  );
}

UILibraryPage.router = LibraryNavigator.router;
UILibraryPage.navigationOptions = LibraryNavigator.navigationOptions;

export default UILibraryPage;
