import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TouchableHighlight,
  AlertIOS,
  Image,
} from 'react-native';
import { createStackNavigator, withNavigation } from 'react-navigation';
import { TitleView } from './Components';
import InputPage from './components/InputPage';
import GenericPage from './components/GenericPage';
import CallToActionButton from '../ono-components/CallToActionButton';

import HomeScreen from './screens/HomeScreen';
import HostHomeScreen from './screens/HostHomeScreen';
import KitchenEngScreen from './screens/KitchenEngScreen';
import KioskSettingsScreen from './screens/KioskSettingsScreen';
import KioskHomeScreen from './screens/KioskHomeScreen';
// import ProductScreen from './screens/ProductScreen';
// import OrderConfirmScreen from './screens/OrderConfirmScreen';
// import OrderCompleteScreen from './screens/OrderCompleteScreen';
// import CollectNameScreen from './screens/CollectNameScreen';
// import CollectEmailScreen from './screens/CollectEmailScreen';
// import CollectPaymentScreen from './screens/CollectPaymentScreen';

import JSONView from '../debug-views/JSONView';
import { Client } from '../ono-data-client/OnoDataClient';
import { withObservables } from '../aven-data-client/DataClient';

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

const App = createStackNavigator(
  {
    Home: HomeScreen,
    HostHome: HostHomeScreen,
    KitchenEng: KitchenEngScreen,
    KioskSettings: KioskSettingsScreen,
    KioskHome: KioskHomeScreen,
    // Product: ProductScreen,
    // OrderConfirm: OrderConfirmScreen,
    // OrderComplete: OrderCompleteScreen,
    // CollectName: CollectNameScreen,
    // CollectEmail: CollectEmailScreen,
    // CollectPayment: CollectPaymentScreen,
  },
  {
    navigationOptions: {
      header: <View style={{ height: 0 }} />,
    },
  },
);

const AppContainer = () => (
  <View style={{ flex: 1 }}>
    <App />
  </View>
);

export default AppContainer;

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
