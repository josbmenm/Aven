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
import PortalHomeScreen from '../screens/PortalHomeScreen';
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
import SequencerScreen from '../screens/SequencerScreen';
import Button from '../components/Button';
import OrderConfirmScreen from '../screens/OrderConfirmScreen';
import DeviceManagerScreen from '../screens/DeviceManagerScreen';
import { OrderCompletePortalScreen } from '../screens/OrderCompleteScreen';
import CollectNameScreen from '../screens/CollectNameScreen';
import SendReceiptScreen from '../screens/SendReceiptScreen';
import InventoryScreen from '../screens/InventoryScreen';
import AlarmsScreen from '../screens/AlarmsScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AppUpsellScreen from '../screens/AppUpsellScreen';
import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import LinearGradient from 'react-native-linear-gradient';
import { CloudContext } from '../cloud-core/KiteReact';
import ErrorContainer from '../cloud-react/ErrorContainer';
import { OrderContextProvider } from '../ono-cloud/OnoKitchen';
import { PortalOrderSidebarPage } from '../components/OrderSidebarPage';
import TabsScreen from '../components/TabsScreen';
import { PopoverContainer } from '../views/Popover';
import { registerDispatcher } from '../card-reader/CardReader';
import { ThemeProvider } from '../dashboard/Theme';
import OnoTheme from '../logic/OnoTheme';
import { HostContextContainer } from '../components/AirtableImage';
import createNativeNetworkSource from '../cloud-native/createNativeNetworkSource';
import RootAuthenticationSection from '../screens/RootAuthenticationSection';

let IS_DEV = process.env.NODE_ENV !== 'production';
IS_DEV = false;

const windowSize = Dimensions.get('window');

const RESTAURANT_DEV = {
  useSSL: false,
  authority: 'localhost:8830',
  quiet: false,

  // authority: '192.168.1.81:8830',
  // authority: '192.168.1.81:8830',
};
const RESTAURANT_PROD = {
  useSSL: false,
  authority: '10.10.1.200:8830',
};

const HOST_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

const cloudSource = createNativeNetworkSource(HOST_CONFIG);

YellowBox.ignoreWarnings([
  'background tab',
  'Async Storage has been',
  'with an invalid bridge',
  'CardReaderLog',
]);

registerDispatcher(cloudSource.dispatch);

let codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

const isProduction = process.env.NODE_ENV !== 'development';

isProduction &&
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
  { routeName: 'Sequencer', title: 'Machine' },
  { routeName: 'Tasks', title: 'Tasks' },
  { routeName: 'Orders', title: 'Orders' },
  { routeName: 'Inventory', title: 'Inventory' },
  { routeName: 'Alarms', title: 'Alarms' },
  { routeName: 'Settings', title: 'Settings' },
];

const PortalHome = createSwitchNavigator({
  Inventory: { screen: InventoryScreen },
  Sequencer: { screen: SequencerScreen },
  Tasks: { screen: TasksScreen },
  Orders: { screen: OrdersScreen },
  Status: { screen: RestaurantStatusScreen },
  Alarms: { screen: AlarmsScreen },
  Settings: { screen: KioskSettingsScreen },
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

  // Inventory: InventoryScreen,
  // DeviceManager: DeviceManagerScreen,
  // RestaurantStatus: RestaurantStatusScreen,
  OrderConfirmTest: OrderConfirmTestScreen,
  // Sequencer: SequencerScreen,
  // EngDashboard: EngDashboardScreen,
  // Orders: OrdersScreen,
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

const NAV_STORAGE_KEY = 'NavigationState-N3e2u121o';
function FullApp() {
  const cloud = useCloudProvider({
    source: cloudSource,
    domain: 'onofood.co',
  });
  if (!cloud) {
    return null;
  }
  return (
    <ThemeProvider value={OnoTheme}>
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
              <AppContainer persistenceKey={NAV_STORAGE_KEY} />
            </ErrorContainer>
          </PopoverContainer>
        </CloudContext.Provider>
      </HostContextContainer>
    </ThemeProvider>
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