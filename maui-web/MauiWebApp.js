import React from 'react';
import createFullscreenSwitchNavigator from '../navigation-web/createFullscreenSwitchNavigator';
import Home from './HomePage';
import Menu from './MenuPage';
import BlendPage from './BlendPage';
import OurStory from './OurStoryPage';
import Privacy from './PrivacyPage';
import Terms from './TermsPage';
import BookUs from './BookUsPage';
import InternalAccount from './InternalAccountPage';
import InternalDashboard from './InternalDashboardPage';
// import Schedule from './SchedulePage';
import RequestLocation from './RequestLocationPage';
import Press from './PressPage';
import Subscribe from './SubscribePage';
import SubscribeConfirm from './SubscribeConfirmPage';
import OnoTheme from '../logic/OnoTheme';
import { ThemeProvider } from '../dashboard/Theme';
import Receipt from './ReceiptPage';
import { CloudContext } from '../cloud-core/KiteReact';

const customHTMLHeaders = `
<meta name="viewport" content="width=device-width, initial-scale=1" />
`;
export const MauiWebRoutes = {
  Home: {
    path: '',
    screen: Home,
  },
  Menu: {
    path: 'menu',
    screen: Menu,
  },
  Blend: {
    path: 'menu/:slug',
    screen: BlendPage,
  },
  OurStory: {
    path: 'our-story',
    screen: OurStory,
  },
  Privacy: {
    path: 'legal/privacy',
    screen: Privacy,
  },
  Terms: {
    path: 'legal/terms',
    screen: Terms,
  },
  BookUs: {
    path: 'book-us',
    screen: BookUs,
  },
  // Schedule: {
  //   path: 'schedule',
  //   screen: Schedule,
  // },
  RequestLocation: {
    path: 'request-location',
    screen: RequestLocation,
  },
  Press: {
    path: 'press',
    screen: Press,
  },
  Subscribe: {
    path: 'subscribe',
    screen: Subscribe,
  },
  SubscribeConfirm: {
    // todo, move mailchimp over to this one
    path: 'subscription-confirmed',
    screen: SubscribeConfirm,
  },
  SubscribeConfirmLegacy: {
    path: 'confirmed',
    screen: SubscribeConfirm,
  },
  Receipt: {
    path: 'receipt/:orderId',
    screen: Receipt,
  },
  InternalAccount: {
    path: 'internal/account',
    screen: InternalAccount,
  },
  InternalDashboard: {
    path: 'internal/dashboard',
    screen: InternalDashboard,
  },
};

const AppNavigator = createFullscreenSwitchNavigator(MauiWebRoutes, {
  defaultNavigationOptions: {
    customHTMLHeaders,
  },
});

function App(props) {
  const cloud = React.useContext(CloudContext);
  return (
    <ThemeProvider value={OnoTheme}>
      <AppNavigator {...props} screenProps={{ cloud }} />
    </ThemeProvider>
  );
}

App.router = AppNavigator.router;
App.navigationOptions = AppNavigator.navigationOptions;

export default App;
