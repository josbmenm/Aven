if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

import React from 'react';
import {
  View,
  Text,
  StatusBar,
  AsyncStorage,
  ScrollView,
  YellowBox,
  Dimensions,
} from 'react-native';
import { createAppContainer } from '../navigation-native';
import { createSwitchNavigator } from '../navigation-core';
import codePush from 'react-native-code-push';
import ComponentPlaygroundScreen from '../screens/ComponentPlaygroundScreen';
import ProductHomeScreen from '../screens/ProductHomeScreen';
import KitchenEngScreen from '../screens/KitchenEngScreen';
import RestaurantStatusScreen from '../screens/RestaurantStatusScreen';
import KitchenEngSubScreen from '../screens/KitchenEngSubScreen';
import PaymentDebugScreen from '../screens/PaymentDebugScreen';
import OrderConfirmTestScreen from '../screens/OrderConfirmTestScreen';
import KioskSettingsScreen from '../screens/KioskSettingsScreen';
import KioskHomeScreen from '../screens/KioskHomeScreen';
import BlendScreen from '../screens/BlendScreen';
import CustomizeBlendScreen from '../screens/CustomizeBlendScreen';
import FoodScreen from '../screens/FoodScreen';
import OrdersScreen from '../screens/OrdersScreen';
import TasksScreen from '../screens/TasksScreen';
import useCloudProvider from '../components/useCloudProvider';
import { FeedbackAppNavigator } from '../components/FeedbackApp';
import SequencerScreen from '../screens/SequencerScreen';
import Button from '../components/Button';
import OrderConfirmScreen from '../screens/OrderConfirmScreen';
import InternalOrderScreen from '../screens/InternalOrderScreen';
import DeviceManagerScreen from '../screens/DeviceManagerScreen';
import ConfiguratorScreen from '../screens/ConfiguratorScreen';
import { OrderCompletePortalScreen } from '../screens/OrderCompleteScreen';
import CollectNameScreen from '../screens/CollectNameScreen';
import SendReceiptScreen from '../screens/SendReceiptScreen';
import OrganizationScreen from '../screens/OrganizationScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AppUpsellScreen from '../screens/AppUpsellScreen';
import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import LinearGradient from 'react-native-linear-gradient';
import { CloudContext } from '../cloud-core/KiteReact';
import ErrorContainer from '../cloud-react/ErrorContainer';
import { OrderContextProvider } from '../ono-cloud/OrderContext';
import { PortalOrderSidebarPage } from '../components/OrderSidebarPage';
import TabsScreen from '../components/TabsScreen';
import { PopoverContainer } from '../views/Popover';
import { registerDispatcher } from '../card-reader/CardReader';
import { ThemeProvider as OldThemeProvider } from '../dashboard/Theme';
import OLD_OnoTheme from '../logic/OnoTheme';
import { HostContextContainer } from '../components/AirtableImage';
import createNativeNetworkSource from '../cloud-native/createNativeNetworkSource';
import RootAuthenticationSection from '../screens/RootAuthenticationSection';
import OnoThemeProvider from '../components/Onotheme';

import * as Sentry from '@sentry/react-native';

const appPackage = require('../app.json');

let IS_DEV = process.env.NODE_ENV !== 'production';

// IS_DEV = false;
// IS_DEV = true;
// ^^ ALWAYS COMMENT THIS OUT BEFORE COMMIT AND DEPLOY! ^^

const windowSize = Dimensions.get('window');

const IS_DEVELOPING_CONFIGURATOR = false;

const RESTAURANT_DEV = {
  quiet: true,
  useSSL: false,
  // authority: 'localhost:8830',

  // prod server (connect to maui wifi first..)
  authority: '10.10.1.200:8830',

  // prod server from ono wifi
  // authority: '192.168.1.106:8830',

  // ono wifi (eric mbp addresses)
  // authority: '192.168.1.81:8830',

  // authority: '10.10.1.200:8830',
};
const RESTAURANT_PROD = {
  useSSL: false,
  authority: '10.10.1.200:8830',

  // DEV tests:
  // authority: 'localhost:8830',
  // authority: '10.10.10.200:8830',
};

const HOST_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

const cloudSource = createNativeNetworkSource(HOST_CONFIG);

const isProduction = process.env.NODE_ENV !== 'development'; // same as IS_DEV

if (isProduction) {
  Sentry.init({
    dsn: appPackage.sentryDSN,
  });
  codePush
    .getUpdateMetadata()
    .then(update => {
      console.log('Codepush metadata: ', update);
      if (update) {
        const releaseString = `${update.appVersion}-codepush:${update.label}`;
        Sentry.setRelease(releaseString);
        console.log('Set Sentry release string to: ' + releaseString);
      }
    })
    .catch(err => {
      console.error('Failed to get codepush metadata!');
      console.error(err);
    });
  setInterval(() => {
    codePush
      .sync({
        updateDialog: false,
        installMode: codePush.InstallMode.IMMEDIATE,
      })
      .then(() => {})
      .catch(e => {
        console.error('Code update check failed');
        console.error(e);
      });
  }, 10000);
}

YellowBox.ignoreWarnings([
  'background tab',
  'Async Storage has been',
  'with an invalid bridge',
  // 'CardReaderLog',
  'following components: AnimatedCom',
]);

registerDispatcher(cloudSource.dispatch);

let codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

StatusBar.setHidden(true, 'none');

const OrderNavigator = createStackTransitionNavigator(
  {
    ProductHome: ProductHomeScreen,
    Blend: BlendScreen,
    CustomizeBlend: CustomizeBlendScreen,
    Food: FoodScreen,
  },
  {
    alwaysTopRoute: null,
    ContainerView: PortalOrderSidebarPage,
  },
);

const KioskNavigator = createStackTransitionNavigator(
  {
    KioskHome: KioskHomeScreen,
    OrderConfirm: OrderConfirmScreen,
    CollectName: CollectNameScreen,
    SendReceipt: SendReceiptScreen,
    Receipt: ReceiptScreen,
    AppUpsell: AppUpsellScreen,
    OrderNavigator,
  },
  {
    alwaysTopRoute: 'KioskHome',
    ContainerView: OrderContextProvider,
  },
);

function KioskApp({ navigation }) {
  const scale = windowSize.width / 1366;
  const translateX = (windowSize.width - 1366) / 2;
  const translateY = (windowSize.height - 1024) / 2;
  return (
    <View
      style={{
        flex: 1,
        transform: [
          { scaleX: scale },
          { scaleY: scale },
          { translateX },
          { translateY },
        ],
      }}
    >
      <View style={{ width: 1366, height: 1024 }}>
        <KioskNavigator navigation={navigation} />
      </View>
    </View>
  );
}
KioskApp.router = KioskNavigator.router;
KioskApp.navigationOptions = KioskNavigator.navigationOptions;

process.env.REACT_NAV_LOGGING = true;

const TABS = [
  { routeName: 'Status', title: 'System' },
  { routeName: 'Tasks', title: 'Tasks' },
  { routeName: 'Orders', title: 'Orders' },
  {
    routeName: 'Inventory',
    title: 'Inventory',
    stateStreamHook: InventoryScreen.useStateStream,
  },
  { routeName: 'Settings', title: 'Settings' },
];

IS_DEVELOPING_CONFIGURATOR &&
  TABS.push({
    routeName: 'Configurator',
    title: 'Config',
  });

const PortalHome = createSwitchNavigator({
  Inventory: { screen: InventoryScreen },
  Tasks: { screen: TasksScreen },
  Orders: { screen: OrdersScreen },
  Status: { screen: RestaurantStatusScreen },
  Settings: { screen: KioskSettingsScreen },
  Configurator: { screen: ConfiguratorScreen },
});

function PortalHomeApp({ navigation }) {
  return (
    <RootAuthenticationSection>
      <TabsScreen tabs={TABS} navigation={navigation}>
        <PortalHome navigation={navigation} />
      </TabsScreen>
    </RootAuthenticationSection>
  );
}
PortalHomeApp.router = PortalHome.router;
PortalHomeApp.navigationOptions = PortalHome.navigationOptions;

const App = createStackTransitionNavigator({
  Home: PortalHomeApp,
  KitchenEng: KitchenEngScreen,
  KitchenEngSub: KitchenEngSubScreen,
  OrderComplete: OrderCompletePortalScreen,
  Kiosk: KioskApp,
  ComponentPlayground: ComponentPlaygroundScreen,
  DeviceManager: DeviceManagerScreen,
  PaymentDebug: PaymentDebugScreen,
  InternalOrder: InternalOrderScreen,
  Sequencer: { screen: SequencerScreen },
  FeedbackApp: FeedbackAppNavigator,
  OrderConfirmTest: OrderConfirmTestScreen,
  Organization: OrganizationScreen,
});

const AppContainer = createAppContainer(App);

function RetryButton({ onRetry }) {
  return <Button title="Try again.." onPress={onRetry} />;
}

function renderAppError({ error, errorInfo, onRetry }) {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Text>O, no!</Text>
      <Text>{error.message}</Text>
      <RetryButton onRetry={onRetry} />
    </ScrollView>
  );
}

const NAV_STORAGE_KEY = 'NavigationState-N3e2u1232asdfas1';
function FullApp() {
  const cloud = useCloudProvider({
    source: cloudSource,
    domain: 'onofood.co',
  });
  if (!cloud) {
    return null;
  }
  return (
    <OldThemeProvider value={OLD_OnoTheme}>
      <OnoThemeProvider>
        <HostContextContainer {...HOST_CONFIG}>
          <CloudContext.Provider value={cloud}>
            <PopoverContainer>
              <ErrorContainer
                renderError={renderAppError}
                onCatch={async (e, info, onRetry) => {
                  if (e.type === 'SessionInvalid') {
                    cloud.destroySession({ ignoreRemoteError: true });
                    onRetry();
                  }

                  await AsyncStorage.removeItem(NAV_STORAGE_KEY);
                }}
              >
                <PopoverContainer>
                  <AppContainer persistenceKey={NAV_STORAGE_KEY} />
                </PopoverContainer>
              </ErrorContainer>
            </PopoverContainer>
          </CloudContext.Provider>
        </HostContextContainer>
      </OnoThemeProvider>
    </OldThemeProvider>
  );
}

const PRELOAD_IMAGES = [
  require('../components/assets/BgHome.png'),
  require('../components/assets/BgGeneric.png'),
];

// loadImages(PRELOAD_IMAGES)
//   .then(results => {
//     console.log('images preloaded!');
//   })
//   .catch(err => {
//     console.error('Error preloading the images!', err);
//   });

const ENABLE_DEV_OVERLAY = false;

function withDevOverlay(FullApp) {
  if (__DEV__ && ENABLE_DEV_OVERLAY) {
    function FullAppDev() {
      return (
        <View style={{ flex: 1 }}>
          <FullApp />
          <LinearGradient
            colors={['#ffffffff', '#ffffff00']}
            style={{
              position: 'absolute',
              right: 250,
              left: 250,
              height: 50,
              top: 0,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Button
              title="refresh"
              onPress={() => {
                codePush.restartApp();
              }}
            />
            <Button
              title="clear nav"
              onPress={() => {
                AsyncStorage.removeItem(NAV_STORAGE_KEY);
              }}
            />
          </LinearGradient>
        </View>
      );
    }
    return FullAppDev;
  }
  return FullApp;
}

const AutoUpdatingApp = codePush(codePushOptions)(withDevOverlay(FullApp));

export default AutoUpdatingApp;
