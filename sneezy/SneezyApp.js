import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
} from 'react-native';
import { createSwitchNavigator } from '../navigation-core';
import Admin from '../admin/Admin';
import Terms from './Terms';
import Privacy from './Privacy';
import FocusExample from './FocusExample';
import ReceiptPage from './ReceiptPage';
import PreviewHome from './PreviewHome';

import { monsterra } from '../components/Styles';
import useCloud from '../cloud-core/useCloud';
import xs from 'xstream';
import useCloudValue from '../cloud-core/useCloudValue';
import TokensPage from './TokensPage';
import Home from './Home';
import MenuPage from './Menu';
import OLDBlendMenu from './OLDBlendMenu';
import OurStory from './OurStory'
import { ThemeContext, theme } from './ThemeContext';

const Main = () => (
  <View
    style={{
      flex: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      flexDirection: 'row',
    }}
  >
    <Text
      style={{
        fontSize: 24,
        color: monsterra,
        fontFamily: 'Maax',
      }}
    >
      not found
    </Text>
  </View>
);

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
    // Menu: {
    //   path: 'icanneverremembertheblendrecipes',
    //   screen: BlendMenu,
    // },
    // Terms,
    // Privacy,
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
    Tokens: {
      path: 'design-tokens',
      screen: TokensPage
    },
    Menu: {
      path: 'menu',
      screen: MenuPage,
    },
    OurStory: {
      path: 'our-story',
      screen: OurStory
    },
    OldMenu: {
      path: 'old/menu',
      screen: OLDBlendMenu,
    }
  }
);

function Root(props) {
  return (
    <ThemeContext.Provider value={theme}>
      <App {...props} />
    </ThemeContext.Provider>
  )
}

Root.router = App.router;

export default Root;
