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
import BlendMenu from './BlendMenu';
import { monsterra } from '../components/Styles';

import useCloud from '../cloud-core/useCloud';
import xs from 'xstream';
import useCloudValue from '../cloud-core/useCloudValue';

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
  src: url('/fonts/Maax - Bold-205TF/Maax - Bold-205TF.ttf');
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
      screen: Main,
      navigationOptions: {
        backgroundColor: '#FFFFFF',
        title: 'ono food co',
        customCSS: fontsCSS,
        customHTML: GoogleAnalyticsTag,
      },
      path: '',
    },
    Admin: {
      screen: SkynetAdmin,
      path: 'admin',
    },
    Receipt: ReceiptPage,
    Menu: {
      screen: BlendMenu,
      path: 'icanneverremembertheblendrecipes',
    },
    Terms,
    Privacy,
    Menu2: {
      screen: BlendMenu,
      path: 'secrets/blendmenu',
    },
    // Focus: {
    //   screen: FocusExample,
    //   path: 'focus',
    // },
  },
  {},
);

export default App;
