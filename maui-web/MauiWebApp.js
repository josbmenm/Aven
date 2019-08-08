import React from 'react';
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
    Schedule: {
      path: 'schedule',
      screen: Schedule,
    },
    RequestLocation: {
      path: 'request-location',
      screen: RequestLocation,
    },
    Subscribe: {
      path: 'subscribe',
      screen: Subscribe,
    },
  },
  {
    defaultNavigationOptions: {
      customHTMLHeaders,
    },
  },
);

function Root(props) {
  return (
    <ThemeProvider value={OnoTheme}>
      <App {...props} />
    </ThemeProvider>
  );
}

Root.router = App.router;
Root.navigationOptions = App.navigationOptions;

export default Root;
