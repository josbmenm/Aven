import React, { Component } from 'react';
import { View, StatusBar, Image } from 'react-native';
import { createAppContainer } from '@react-navigation/native';
import codePush from 'react-native-code-push';

import HomeScreen from './screens/HomeScreen';
import HostHomeScreen from './screens/HostHomeScreen';
import KitchenEngScreen from './screens/KitchenEngScreen';
import KitchenEngSubScreen from './screens/KitchenEngSubScreen';
import KioskSettingsScreen from './screens/KioskSettingsScreen';
import { setHostConfig } from './components/AirtableImage';
import KioskHomeScreen from './screens/KioskHomeScreen';
import MenuItemScreen from './screens/MenuItemScreen';
import DebugStateScreen from './screens/DebugStateScreen';
import PaymentDebugScreen from './screens/PaymentDebugScreen';

import OrderConfirmScreen from './screens/OrderConfirmScreen';
// import OrderCompleteScreen from './screens/OrderCompleteScreen';
// import CollectNameScreen from './screens/CollectNameScreen';
// import CollectEmailScreen from './screens/CollectEmailScreen';

import JSONView from '../debug-views/JSONView';
import OnoRestaurantContext from '../ono-cloud/OnoRestaurantContext';
import createCloudClient from '../aven-cloud/createCloudClient';
import createNativeNetworkSource from '../aven-cloud-native/createNativeNetworkSource';
import createFadeNavigator from '../aven-navigation-fade-navigator/createFadeNavigator';

let codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };

setInterval(() => {
  codePush
    .sync({
      updateDialog: false,
      installMode: codePush.InstallMode.IMMEDIATE,
    })
    .then(() => {
      console.log('Code update check success');
    })
    .catch(e => {
      console.error('Code update check failed');
      console.error(e);
    });
}, 10000);

StatusBar.setHidden(true, 'none');

// console.ignoredYellowBox = ['Warning:'];

const PlaceholderImage = ({ style, color }) => (
  <Image
    source={{ uri: 'https://i.imgur.com/jyD9vCX.jpg' }}
    resizeMode="stretch"
    style={style}
  />
);

// const DebugDataD = ({ input }) => {
//   return (
//     <View style={{ padding: 40 }}>
//       <JSONView data={input} />
//     </View>
//   );
// };
// const DebugData = withObservables(['input'], props => ({
//   input: props.input,
// }))(DebugDataD);

// const StatusTag = ({ isGoodNews, goodNews, badNews }) => {
//   const statusColor = isGoodNews ? '#090' : '#900';
//   return (
//     <View
//       style={{
//         flexDirection: 'row',
//         justifyContent: 'flex-end',
//         paddingHorizontal: 40,
//       }}
//     >
//       <View
//         style={{
//           backgroundColor: statusColor,
//           padding: 8,
//           paddingHorizontal: 18,
//           borderRadius: 25,
//         }}
//       >
//         <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 26 }}>
//           {isGoodNews ? goodNews : badNews}
//         </Text>
//       </View>
//     </View>
//   );
// };

// const ConnectionStatus = withObservables([], () => ({
//   isConnected: Client.isConnected,
// }))(({ isConnected }) => (
//   <StatusTag
//     isGoodNews={isConnected}
//     goodNews="Connected to Kitchen Manager"
//     badNews="Not connected to kitchen!"
//   />
// ));

const App = createFadeNavigator(
  {
    Home: HomeScreen,
    HostHome: HostHomeScreen,
    KitchenEng: KitchenEngScreen,
    KitchenEngSub: KitchenEngSubScreen,
    KioskSettings: KioskSettingsScreen,
    KioskHome: KioskHomeScreen,
    MenuItem: MenuItemScreen,
    DebugState: DebugStateScreen,

    OrderConfirm: OrderConfirmScreen,
    // OrderComplete: OrderCompleteScreen,
    // CollectName: CollectNameScreen,
    // CollectEmail: CollectEmailScreen,
    PaymentDebug: PaymentDebugScreen,
  },
  {
    headerMode: 'none',
  },
);

const AppContainer = createAppContainer(App);

const IS_DEV = process.env.NODE_ENV !== 'production';

const RESTAURANT_DEV = {
  useSSL: false,
  authority: 'localhost:8830',
};
const RESTAURANT_PROD = {
  useSSL: false,
  authority: '192.168.1.200:8830',
};

const HOST_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

setHostConfig(HOST_CONFIG);

const dataSource = createNativeNetworkSource(HOST_CONFIG);

const restaurant = createCloudClient({
  dataSource,
  domain: 'kitchen.maui.onofood.co',
});

const FullApp = () => (
  <OnoRestaurantContext.Provider value={restaurant}>
    <AppContainer />
  </OnoRestaurantContext.Provider>
);

const UpdatingApp = codePush(codePushOptions)(FullApp);

export default UpdatingApp;

// class ReadyOrders extends React.Component {
//   state = {clearedIds: []}
//   render() {
//     const {orders} = this.props;
//     const output = [];
//     for (let orderId in orders) {
//       if (this.state.clearedIds.indexOf(orderId)!==-1) { return}
//       const order = orders[orderId];
//       output.push(
//     <TouchableOpacity onPress={() => {
//       this.setState(state => ({clearedIds: [...state.clearedIds, orderId]}))
//     }}><Text style={{fontSize: 80, textAlign: 'center'}}>{JSON.stringify(order.details.name)}</Text></TouchableOpacity>)
//   }
//   return <React.Fragment>{output}<React.Fragment>;
//   }
// }
//
// const OrderStatus = ({orders}) => {
//   const readyOrders = [];
//   for (let orderId in orders) {
//     const order = orders[orderId];
//     // if (order.status === 'ready') {
//       readyOrders.push(order);
//     // }
//   }
//   return <ReadyOrders orders={readyOrders} />
// }
//
// const PickupScreen = () => <Provider><Subscribe to={[truck]}>{truck => <OrderStatus orders={truck.state.orders} />}</Subscribe></Provider>

// export default PickupScreen;
