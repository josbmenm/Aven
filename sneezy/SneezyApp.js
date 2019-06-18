import React from 'react';
import { createSwitchNavigator } from '../navigation-core';
import TokensPage from './TokensPage';
import Home from './Home';
import MenuPage from './Menu';
import OLDBlendMenu from './OLDBlendMenu';
import OurStory from './OurStory';
import Privacy from './Privacy';
import Terms from './Terms';
import BookWithUs from './BookWithUs';
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
      screen: MenuPage,
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
    BookWithUs: {
      path: 'book-us',
      screen: BookWithUs,
    },

    // to be deleted:
    OldMenu: {
      path: 'old/menu',
      screen: OLDBlendMenu,
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
