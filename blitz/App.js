import React, { Component } from 'react';
import { View, StatusBar, Image } from 'react-native';
import { createAppContainer } from '../navigation-native';
import codePush from 'react-native-code-push';

import HomeScreen from './screens/HomeScreen';
import ProductHomeScreen from './screens/ProductHomeScreen';
import HostHomeScreen from './screens/HostHomeScreen';
import KitchenEngScreen from './screens/KitchenEngScreen';
import KitchenEngSubScreen from './screens/KitchenEngSubScreen';
import KioskSettingsScreen from './screens/KioskSettingsScreen';
import KioskHomeScreen from './screens/KioskHomeScreen';
import MenuItemScreen from './screens/MenuItemScreen';
import DebugStateScreen from './screens/DebugStateScreen';
import PaymentDebugScreen from './screens/PaymentDebugScreen';

import OrderConfirmScreen from './screens/OrderConfirmScreen';
import ManageOrderScreen from './screens/ManageOrderScreen';
import ManageOrdersScreen from './screens/ManageOrdersScreen';
import OrderCompleteScreen from './screens/OrderCompleteScreen';
import CollectNameScreen from './screens/CollectNameScreen';
import CollectEmailScreen from './screens/CollectEmailScreen';
import AppUpsellScreen from './screens/AppUpsellScreen';

import CloudContext from '../aven-cloud/CloudContext';
import createCloudClient from '../aven-cloud/createCloudClient';
import { createStackNavigator } from '../navigation-stack';
import { OrderContextProvider } from '../ono-cloud/OnoKitchen';
import dataSource from './CloudDataSource';
import AdminSessionContainer from './AdminSessionContainer';

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

const InnerHostNavigator = createStackNavigator(
  {
    HostHome: HostHomeScreen,
    ManageOrders: ManageOrdersScreen,
    ManageOrder: ManageOrderScreen,
    DebugState: DebugStateScreen,
  },
  {
    headerMode: 'none',
  },
);

function HostNavigator({ navigation }) {
  return (
    <AdminSessionContainer>
      <InnerHostNavigator navigation={navigation} />
    </AdminSessionContainer>
  );
}
HostNavigator.router = InnerHostNavigator.router;

const App = createStackNavigator(
  {
    Home: HomeScreen,
    KioskHome: KioskHomeScreen,
    KitchenEng: KitchenEngScreen,
    KitchenEngSub: KitchenEngSubScreen,
    KioskSettings: KioskSettingsScreen,
    MenuItem: MenuItemScreen,
    ProductHome: ProductHomeScreen,
    OrderConfirm: OrderConfirmScreen,
    OrderComplete: OrderCompleteScreen,
    CollectName: CollectNameScreen,
    CollectEmail: CollectEmailScreen,
    PaymentDebug: PaymentDebugScreen,
    AppUpsell: AppUpsellScreen,
    Host: HostNavigator,
  },
  {
    headerMode: 'none',
  },
);

const AppContainer = createAppContainer(App);

const restaurant = createCloudClient({
  dataSource,
  domain: 'kitchen.maui.onofood.co',
});

restaurant
  .CreateAnonymousSession()
  .then(() => {})
  .catch(console.error);

const FullApp = () => (
  <CloudContext.Provider value={restaurant}>
    <OrderContextProvider>
      <AppContainer persistenceKey="24231234211235244" />
    </OrderContextProvider>
  </CloudContext.Provider>
);

const AutoUpdatingApp = codePush(codePushOptions)(FullApp);

export default AutoUpdatingApp;
