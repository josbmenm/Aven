import React from 'react';
import { Text } from 'react-native';
import createFullscreenSwitchNavigator from '../navigation-web/createFullscreenSwitchNavigator';
import Home from './HomePage';
import Menu from './MenuPage';
import BlendPage from './BlendPage';
import OurStory from './OurStoryPage';
import Privacy from './PrivacyPage';
import Terms from './TermsPage';
import BookUs from './BookUsPage';
import Schedule from './SchedulePage';
import RequestLocation from './RequestLocationPage';
import Subscribe from './SubscribePage';
import SubscribeConfirm from './SubscribeConfirmPage';
import OnoTheme from '../logic/OnoTheme';
import { ThemeProvider } from '../dashboard/Theme';

const customHTMLHeaders = `
<meta name="viewport" content="width=device-width, initial-scale=1" />
`;

const App = createFullscreenSwitchNavigator(
  {
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
  },
  {
    defaultNavigationOptions: {
      customHTMLHeaders,
    },
  },
);

const IS_BROWSER =
  typeof process !== 'undefined' &&
  typeof process.versions.node !== 'undefined';

function Root(props) {
  if (false) {
    return (
      <ThemeProvider value={OnoTheme}>
        <React.Suspense fallback={<Text>suspensee...</Text>}>
          <App {...props} />
        </React.Suspense>
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider value={OnoTheme}>
      <App {...props} />
    </ThemeProvider>
  );
}

Root.router = App.router;
Root.navigationOptions = App.navigationOptions;

export default Root;
