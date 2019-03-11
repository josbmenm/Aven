if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

import React, { Component } from 'react';
import {
  View,
  StatusBar,
  Image,
  Button,
  AsyncStorage,
  Alert,
} from 'react-native';
import { createAppContainer } from '../navigation-native';
import { createNavigator, StackRouter } from '../navigation-core';
import codePush from 'react-native-code-push';

import HomeScreen from './screens/HomeScreen';
import ComponentPlaygroundScreen from './screens/ComponentPlaygroundScreen';
import ProductHomeScreen from './screens/ProductHomeScreen';
import HostHomeScreen from './screens/HostHomeScreen';
import KitchenEngScreen from './screens/KitchenEngScreen';
import KitchenEngSubScreen from './screens/KitchenEngSubScreen';
import KioskSettingsScreen from './screens/KioskSettingsScreen';
import KioskHomeScreen from './screens/KioskHomeScreen';
import BlendScreen from './screens/BlendScreen';
import CustomizeBlendScreen from './screens/CustomizeBlendScreen';
import FoodScreen from './screens/FoodScreen';
import DebugStateScreen from './screens/DebugStateScreen';
import PaymentDebugScreen from './screens/PaymentDebugScreen';

import OrderConfirmScreen from './screens/OrderConfirmScreen';
import ManageOrderScreen from './screens/ManageOrderScreen';
import ManageOrdersScreen from './screens/ManageOrdersScreen';
import OrderCompleteScreen from './screens/OrderCompleteScreen';
import CollectNameScreen from './screens/CollectNameScreen';
import SendReceiptScreen from './screens/SendReceiptScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import AppUpsellScreen from './screens/AppUpsellScreen';
import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import Transitioner from '../navigation-transitioner/Transitioner';
import LinearGradient from 'react-native-linear-gradient';

import CloudContext from '../aven-cloud/CloudContext';
import createCloudClient from '../aven-cloud/createCloudClient';
import { createStackNavigator } from '../navigation-stack';
import { OrderContextProvider } from '../ono-cloud/OnoKitchen';
import OnoCloud from './OnoCloud';
import AdminSessionContainer from './AdminSessionContainer';
import OrderSidebarPage from '../components/OrderSidebarPage';

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

// console.ignoredYellowBox = ['Warning:'];

const InnerHostNavigator = createStackTransitionNavigator({
  HostHome: HostHomeScreen,
  ManageOrders: ManageOrdersScreen,
  ManageOrder: ManageOrderScreen,
  DebugState: DebugStateScreen,
});

function HostNavigator({ navigation }) {
  return (
    <AdminSessionContainer>
      <InnerHostNavigator navigation={navigation} />
    </AdminSessionContainer>
  );
}
HostNavigator.router = InnerHostNavigator.router;

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

const App = createStackTransitionNavigator({
  Home: HomeScreen,
  KioskHome: KioskHomeScreen,
  ComponentPlayground: ComponentPlaygroundScreen,
  KitchenEng: KitchenEngScreen,
  KitchenEngSub: KitchenEngSubScreen,
  KioskSettings: KioskSettingsScreen,
  // Blend: BlendScreen,
  // CustomizeBlend: CustomizeBlendScreen,
  // Food: FoodScreen,
  // ProductHome: ProductHomeScreen,
  OrderConfirm: OrderConfirmScreen,
  OrderComplete: OrderCompleteScreen,
  CollectName: CollectNameScreen,
  SendReceipt: SendReceiptScreen,
  Receipt: ReceiptScreen,
  PaymentDebug: PaymentDebugScreen,
  AppUpsell: AppUpsellScreen,
  Host: HostNavigator,
  OrderNavigator,
});

const AppContainer = createAppContainer(App);

const restaurant = createCloudClient({
  dataSource: OnoCloud,
  domain: 'onofood.co',
});

restaurant
  .CreateAnonymousSession()
  .then(() => {})
  .catch(console.error);

class ErrorHandlerContainer extends React.Component {
  componentDidCatch(e) {
    Alert.alert(e.code || 'Error', e.message);
    return true;
  }
  render() {
    const { children } = this.props;
    return children;
  }
}

const NAV_STORAGE_KEY = 'NavigationState3';
const FullApp = () => (
  <CloudContext.Provider value={restaurant}>
    <OrderContextProvider>
      <ErrorHandlerContainer>
        <AppContainer persistenceKey={NAV_STORAGE_KEY} />
      </ErrorHandlerContainer>
    </OrderContextProvider>
  </CloudContext.Provider>
);

const PRELOAD_IMAGES = {
  kioskHomeScreen: require('../components/assets/BgHome.png'),
  genericScreen: require('../components/assets/BgGeneric.png'),
};

async function loadImages(images) {
  // thanks to https://github.com/DylanVann/react-native-fast-image/issues/160#issuecomment-373938649
  return Promise.all(
    Object.keys(images).map(i => {
      let img = {
        ...Image.resolveAssetSource(images[i]),
        cache: 'force-cache',
      };

      return Image.prefetch(img);
    }),
  );
}

loadImages(PRELOAD_IMAGES).then(results => {
  console.log('images preloaded!');
});

const ENABLE_DEV_OVERLAY = true;

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
              color="#000000"
              onPress={() => {
                codePush.restartApp();
              }}
            />
            <Button
              title="clear nav"
              color="#880000"
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
