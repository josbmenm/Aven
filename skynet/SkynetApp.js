import React from 'react';
import { View, Text } from 'react-native';
import createFullscreenSwitchNavigator from '../navigation-web/createFullscreenSwitchNavigator';
import Admin from '../admin/Admin';
import InternalBlendMenu from './InternalBlendMenu';
import FeedbackDashboard from './FeedbackDashboard';
import { MauiWebRoutes } from '../maui-web/MauiWebApp';
import { monsterra } from '../components/Styles';
import getActiveChildNavigationOptions from '../navigation-core/utils/getActiveChildNavigationOptions';
import { CloudContext } from '../cloud-core/KiteReact';
import { ThemeProvider as OLDThemeProvider } from '../dashboard/Theme';
import OLD_OnoTheme from '../logic/OnoTheme';
import OnoThemeProvider from '../components/Onotheme';

const NotFoundPage = () => (
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

function getHTMLHeaders({ screenOptions, navigation, title }) {
  return `
<meta property="og:site_name" content="Ono Blends"/>
<meta property="og:title" content="${screenOptions.metaTitle || title}">
<meta property="og:description" content="${screenOptions.metaDescription ||
    defaultMetaDescription}">
<meta property="og:image" content="${screenOptions.metaImage ||
    defaultMetaImage}">

<meta name="viewport" content="width=device-width, initial-scale=1" />

${screenOptions.customHTMLHeaders ? screenOptions.customHTMLHeaders : ''}
`;
  // <meta property="og:url" content="https://onoblends.co">
}

const AppNavigator = createFullscreenSwitchNavigator(
  {
    Main: {
      screen: NotFoundPage,
      navigationOptions: {
        backgroundColor: '#FFFFFF',
        title: 'ono food co',
        customCSS: fontsCSS,
        customHTML: GoogleAnalyticsTag,
      },
    },
    ...Object.fromEntries(
      Object.entries(MauiWebRoutes).map(([routeName, routeConfig]) => {
        const navigationOptions = ({ navigation, screenProps }) => {
          const screenNavOptionSpec =
            routeConfig.screen.navigationOptions || {};
          const screenOptions =
            typeof screenNavOptionSpec === 'function'
              ? screenNavOptionSpec({ navigation, screenProps })
              : screenNavOptionSpec;

          const title = screenOptions.title
            ? `${screenOptions.title}`
            : 'Ono Blends';
          return {
            ...screenOptions,
            title,
            customHTMLHeaders: getHTMLHeaders({
              screenOptions,
              title,
              navigation,
            }),
            customHTML: GoogleAnalyticsTag,
            customCSS: fontsCSS,
          };
        };
        return [routeName, { ...routeConfig, navigationOptions }];
      }),
    ),
    Admin: {
      screen: SkynetAdmin,
      path: 'admin',
    },
    InternalBlendMenu2: {
      screen: InternalBlendMenu,
      path: 'secrets/blendmenu',
    },
    FeedbackData: {
      screen: FeedbackDashboard,
      path: 'secrets/maui-feedback',
    },
  },
  {},
);

function App(props) {
  const cloud = React.useContext(CloudContext);
  return (
    <OLDThemeProvider value={OLD_OnoTheme}>
      <OnoThemeProvider>
        <AppNavigator {...props} screenProps={{ cloud }} />
      </OnoThemeProvider>
    </OLDThemeProvider>
  );
}

App.router = AppNavigator.router;
App.navigationOptions = AppNavigator.navigationOptions;

export default App;
