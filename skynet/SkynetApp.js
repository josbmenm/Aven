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
import ReceiptPage from './ReceiptPage';
import InternalBlendMenu from './InternalBlendMenu';
import MauiWebApp from '../maui-web/MauiWebApp';
import { monsterra } from '../components/Styles';
import getActiveChildNavigationOptions from '../navigation-core/utils/getActiveChildNavigationOptions';

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
  font-family: Maax-Bold;
}
@font-face {
  src: url('/fonts/Maax - Regular-205TF/Maax - Regular-205TF.ttf');
  font-family: Maax;
}
@font-face {
  src: url('/fonts/Lora.ttf');
  font-family: Lora;
}
@font-face {
  src: url('/fonts/Lora-Bold.ttf');
  font-weight: bold;
}
a:active {
  color: inherit;
}
a:hover {
  color: inherit;
}
a {
  color: inherit;
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

const MetaInfo = `
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

const defaultMetaImage = 'https://onofood.co/img/OnoLanding2.png';
const defaultMetaDescription =
  'Taste the future with Ono Blends. Brought to you by Ono Food Co.';

function getMetaInfo({ screenOptions, navigation, title }) {
  return `
<meta property="og:site_name" content="Ono Blends"/>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${screenOptions.metaDescription ||
    defaultMetaDescription}">
<meta property="og:image" content="${screenOptions.metaImage ||
    defaultMetaImage}">
  `;
  // <meta property="og:url" content="https://onoblends.co">
}

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
    PreviewApp: {
      path: 'maui-preview',
      screen: MauiWebApp,
      navigationOptions: ({ navigation, screenProps }) => {
        const screenOptions = getActiveChildNavigationOptions(
          navigation,
          screenProps,
        );
        const title = screenOptions.title
          ? `${screenOptions.title} | Ono Blends`
          : 'Ono Blends';
        return {
          ...screenOptions,
          title,
          customHTMLHeaders: getMetaInfo({ screenOptions, title, navigation }),
          customHTML: GoogleAnalyticsTag,
          customCSS: screenOptions.customCSS
            ? fontsCSS + '\n' + screenOptions.customCSS
            : fontsCSS,
        };
      },
    },
    Admin: {
      screen: SkynetAdmin,
      path: 'admin',
    },
    Receipt: ReceiptPage,
    InternalBlendMenu2: {
      screen: InternalBlendMenu,
      path: 'secrets/blendmenu',
    },
  },
  {},
);

export default App;
