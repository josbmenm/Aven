import React from 'react';
import { View, Text } from 'react-native';
import { createSwitchNavigator } from '../navigation-core';
import Admin from '../admin/Admin';
// import FocusExample from './FocusExample';
// import ReceiptPage from './ReceiptPage';
// import PreviewHome from './PreviewHome';
// import useCloud from '../cloud-core/useCloud';
// import xs from 'xstream';
// import useCloudValue from '../cloud-core/useCloudValue';
import TokensPage from './TokensPage';
import Home from './Home';
import MenuPage from './Menu';
import OLDBlendMenu from './OLDBlendMenu';
import OurStory from './OurStory';
import Privacy from './Privacy';
import Terms from './Terms';
import BookWithUs from './BookWithUs';
import { ThemeContext, theme, useTheme } from './ThemeContext';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader';

function Main() {
  const theme = useTheme();
  return (
    <GenericPage>
      <GenericHeroHeader
        title="Not Found"
        backgroundColor={theme.colors.lightGrey}
      />
    </GenericPage>
  );
}

const fontsCSS = `
@font-face {
  src: url('/fonts/Maax.ttf');
  font-family: Maax;
}
`;

const GoogleAnalyticsTag = `
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-127774566-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-127774566-1');
</script>
`;
const customHTMLHeaders = `
<meta name="viewport" content="width=device-width, initial-scale=1" />
`;

let authority = '';
let useSSL = true;
if (global.window) {
  authority = global.window.location.host;
  useSSL = global.window.location.protocol.indexOf('s') !== -1;
}
function SkynetAdmin(props) {
  return (
    <Admin
      defaultSession={{
        authority,
        useSSL,
        domain: 'onofood.co',
      }}
      {...props}
    />
  );
}
SkynetAdmin.router = Admin.router;

const App = createSwitchNavigator(
  {
    Main: {
      path: '',
      screen: Main,
      navigationOptions: {
        backgroundColor: '#FFFFFF',
        title: 'ono food co',
        customCSS: fontsCSS,
        customHTML: GoogleAnalyticsTag,
      },
    },
    Admin: {
      path: 'admin',
      screen: SkynetAdmin,
    },
    // PreviewHome,
    // Receipt: ReceiptPage,
    // Menu2: {
    //   path: 'secrets/blendmenu',
    //   screen: BlendMenu,
    // },
    // Focus: {
    //   path: 'secrets/focus-prototype',
    //   screen: FocusExample,
    // },
    Home: {
      path: 'home',
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
    OldMenu: {
      path: 'old/menu',
      screen: OLDBlendMenu,
    },
    BookWithUs: {
      path: 'book-with-us',
      screen: BookWithUs,
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

export default Root;
