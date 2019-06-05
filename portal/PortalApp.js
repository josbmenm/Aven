if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

import React, { Component } from 'react';
import {
  View,
  Text,
  StatusBar,
  AsyncStorage,
  ScrollView,
  YellowBox,
} from 'react-native';
import { createAppContainer } from '../navigation-native';
import { useNavigation } from '../navigation-hooks/Hooks';
import { createNavigator, StackRouter } from '../navigation-core';
import codePush from 'react-native-code-push';

import HomeScreen from '../screens/HomeScreen';
import ComponentPlaygroundScreen from '../screens/ComponentPlaygroundScreen';
import ProductHomeScreen from '../screens/ProductHomeScreen';
import KitchenEngScreen from '../screens/KitchenEngScreen';
import KitchenEngSubScreen from '../screens/KitchenEngSubScreen';
import KioskSettingsScreen from '../screens/KioskSettingsScreen';
import KioskHomeScreen from '../screens/KioskHomeScreen';
import BlendScreen from '../screens/BlendScreen';
import CustomizeBlendScreen from '../screens/CustomizeBlendScreen';
import FoodScreen from '../screens/FoodScreen';
import DebugStateScreen from '../screens/DebugStateScreen';
import PaymentDebugScreen from '../components/PaymentDebugScreen';
import useCloudProvider from '../components/useCloudProvider';
import SequencingDebugScreen from '../screens/SequencingDebugScreen';

import Button from '../components/Button';
import OrderConfirmScreen from '../screens/OrderConfirmScreen';
import GuideDashboardScreen from '../screens/GuideDashboardScreen';
import EngDashboardScreen from '../screens/EngDashboardScreen';
import DeviceManagerScreen from '../screens/DeviceManagerScreen';
import { OrderCompletePortalScreen } from '../screens/OrderCompleteScreen';
import CollectNameScreen from '../screens/CollectNameScreen';
import SendReceiptScreen from '../screens/SendReceiptScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AppUpsellScreen from '../screens/AppUpsellScreen';
import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import Transitioner from '../navigation-transitioner/Transitioner';
import LinearGradient from 'react-native-linear-gradient';
import { loadImages } from '../components/Image';
import CloudContext from '../cloud-core/CloudContext';
import ErrorContainer from '../cloud-react/ErrorContainer';
import { createStackNavigator } from '../navigation-stack';
import { OrderContextProvider } from '../ono-cloud/OnoKitchen';
import { PortalOrderSidebarPage } from '../components/OrderSidebarPage';
import { PopoverContainer } from '../views/Popover';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { registerDispatcher } from '../card-reader/CardReader';

import { HostContextContainer } from '../components/AirtableImage';
import createNativeNetworkSource from '../cloud-native/createNativeNetworkSource';

let IS_DEV = process.env.NODE_ENV !== 'production';
IS_DEV = false;

const RESTAURANT_DEV = {
  useSSL: false,
  authority: 'localhost:8830',
};
const RESTAURANT_PROD = {
  useSSL: false,
  authority: 'restaurant0.maui.onofood.co:8830',
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

process.env.REACT_NAV_LOGGING = true;

const App = createStackTransitionNavigator({
  Home: HomeScreen,
  OrderComplete: OrderCompletePortalScreen,
  Kiosk: KioskNavigator,
  ComponentPlayground: ComponentPlaygroundScreen,
  KitchenEng: KitchenEngScreen,
  KitchenEngSub: KitchenEngSubScreen,
  KioskSettings: KioskSettingsScreen,
  Inventory: InventoryScreen,
  DeviceManager: DeviceManagerScreen,
  PaymentDebug: PaymentDebugScreen,
  SequencingDebug: SequencingDebugScreen,
  EngDashboard: EngDashboardScreen,
  GuideDashboard: GuideDashboardScreen,
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
    <HostContextContainer {...HOST_CONFIG}>
      <PopoverContainer>
        <CloudContext.Provider value={cloud}>
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
        </CloudContext.Provider>
      </PopoverContainer>
    </HostContextContainer>
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
