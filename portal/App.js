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
import DeviceManagerScreen from '../screens/DeviceManagerScreen';
import OrderCompleteScreen from '../screens/OrderCompleteScreen';
import CollectNameScreen from '../screens/CollectNameScreen';
import SendReceiptScreen from '../screens/SendReceiptScreen';
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
import OrderSidebarPage from '../components/OrderSidebarPage';
import { PopoverContainer } from '../views/Popover';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { registerDispatcher } from '../card-reader/CardReader';

import { setHostConfig } from '../components/AirtableImage';
import createNativeNetworkSource from '../cloud-native/createNativeNetworkSource';

// const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_DEV = false;

const RESTAURANT_DEV = {
  useSSL: false,
  authority: '192.168.1.29:8840', // office laptop (skynet)
  // authority: '192.168.1.29:8830', // office laptop
  // authority: 'localhost:8830', // generic simulator
  // authority: 'restaurant0.maui.onofood.co:8830', // prod test
};
const RESTAURANT_PROD = {
  // useSSL: false,
  useSSL: true,
  // authority: 'restaurant0.maui.onofood.co:8830',
  authority: 'www.onofood.co',
};

const HOST_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

setHostConfig(HOST_CONFIG);

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
    ContainerView: OrderSidebarPage,
  },
);

// const App = createStackTransitionNavigator({
//   // Home: HomeScreen,
//   // ComponentPlayground: ComponentPlaygroundScreen,
//   // KitchenEng: KitchenEngScreen,
//   // KitchenEngSub: KitchenEngSubScreen,
//   // KioskSettings: KioskSettingsScreen,
//   KioskHome: KioskHomeScreen,
//   // Blend: BlendScreen,
//   // CustomizeBlend: CustomizeBlendScreen,
//   // Food: FoodScreen,
//   // ProductHome: ProductHomeScreen,
//   OrderConfirm: OrderConfirmScreen,
//   OrderComplete: OrderCompleteScreen,
//   CollectName: CollectNameScreen,
//   SendReceipt: SendReceiptScreen,
//   Receipt: ReceiptScreen,
//   PaymentDebug: PaymentDebugScreen,
//   SequencingDebug: SequencingDebugScreen,
//   AppUpsell: AppUpsellScreen,
//   OrderNavigator,
// });

const App = createStackTransitionNavigator({
  Home: HomeScreen,
  ComponentPlayground: ComponentPlaygroundScreen,
  KitchenEng: KitchenEngScreen,
  KitchenEngSub: KitchenEngSubScreen,
  KioskSettings: KioskSettingsScreen,
  KioskHome: KioskHomeScreen,
  OrderConfirm: OrderConfirmScreen,
  DeviceManager: DeviceManagerScreen,
  OrderComplete: OrderCompleteScreen,
  CollectName: CollectNameScreen,
  SendReceipt: SendReceiptScreen,
  Receipt: ReceiptScreen,
  PaymentDebug: PaymentDebugScreen,
  SequencingDebug: SequencingDebugScreen,
  AppUpsell: AppUpsellScreen,
  OrderNavigator,
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

const NAV_STORAGE_KEY = 'NavigationState-N3e26u1o';
function FullApp() {
  const cloud = useCloudProvider({
    source: cloudSource,
    domain: 'onofood.co',
  });
  if (!cloud) {
    return null;
  }
  return (
    <PopoverContainer>
      <CloudContext.Provider value={cloud}>
        <ErrorContainer
          renderError={renderAppError}
          onCatch={async () => {
            await AsyncStorage.removeItem(NAV_STORAGE_KEY);
          }}
        >
          <AppContainer />
        </ErrorContainer>
      </CloudContext.Provider>
    </PopoverContainer>
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
