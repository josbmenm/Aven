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

const colors = {
  bg: '#FFF3EB',
  link: '#4987F9',
  title: '#4E6F9D',
};

const LogoText = () => (
  <Text
    style={{
      fontSize: 64,
      color: colors.title,
      fontFamily: 'Shrikhand',
      marginVertical: 25,
    }}
  >
    ono
  </Text>
);

const EmailLink = ({ children, to }) => (
  <TouchableOpacity
    onPress={() => {
      window.location = `mailto:${to}`;
    }}
  >
    <Text
      style={{ fontSize: 24, color: colors.link, fontFamily: 'ArbutusSlab' }}
    >
      {children}
    </Text>
  </TouchableOpacity>
);

const Main = () => (
  <View
    style={{
      flex: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      flexDirection: 'row',
    }}
  >
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        left: 0,
        right: -375,
        top: -50,
        bottom: -50,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <Image
          style={{
            flex: 1,
            resizeMode: 'cover',
            minWidth: 1000,
            minHeight: 950,
          }}
          source={require('./graphics/ono-shapes.svg')}
        />
      </View>
    </View>
    <View
      style={{
        maxWidth: 500,
        flex: 1,
        paddingTop: 50,
        paddingBottom: 200,
        paddingHorizontal: 30,
        justifyContent: 'center',
      }}
    >
      <LogoText />
      <View
        style={{
          flexWrap: 'wrap',
          flexDirection: 'row',
          marginVertical: 20,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            color: colors.title,
            fontFamily: 'ArbutusSlab',
          }}
        >
          dine &amp; dash /{' '}
        </Text>
        <Text
          style={{
            fontSize: 24,
            color: colors.title,
            fontFamily: 'ArbutusSlab',
          }}
        >
          coming 2019
        </Text>
      </View>
      <EmailLink to="aloha@onofood.co">say aloha →</EmailLink>
      <View style={{ flex: 1, maxHeight: '50%' }} />
    </View>
  </View>
);

const fontsCSS = `
@font-face {
  src: url('/fonts/Shrikhand.otf');
  font-family: Shrikhand;
}
@font-face {
  src: url('/fonts/ArbutusSlab.ttf');
  font-family: ArbutusSlab;
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

const App = createSwitchNavigator({
  Main: {
    screen: Main,
    navigationOptions: {
      backgroundColor: colors.bg,
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
});

export default App;
