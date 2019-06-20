import React from 'react';
import { createSwitchNavigator } from '../navigation-core';
import TokensPage from './TokensPage';
import Home from './HomePage';
import Menu from './MenuPage';
import BlendPage from './BlendPage';
import OurStory from './OurStoryPage';
import Privacy from './PrivacyPage';
import Terms from './TermsPage';
import BookUs from './BookUsPage';
import Schedule from './SchedulePage';
import Subscribe from './SubscribePage';
import { ThemeContext, theme } from './ThemeContext';

const customHTMLHeaders = `
<meta name="viewport" content="width=device-width, initial-scale=1" />
`;

const App = createSwitchNavigator(
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
      path: 'blend',
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
    Tokens: {
      path: 'design-tokens',
      screen: TokensPage,
    },
    BookUs: {
      path: 'book-us',
      screen: BookUs,
    },
    Schedule: {
      path: 'shedule',
      screen: Schedule,
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
    <ThemeContext.Provider value={theme}>
      <App {...props} />
    </ThemeContext.Provider>
  );
}

Root.router = App.router;
Root.navigationOptions = App.navigationOptions;

export default Root;
