import React, { Component, useReducer, useEffect } from 'react';
import BitRow from '../components/BitRow';

import RowSection from '../components/RowSection';
import { View, ScrollView, Text } from 'react-native';
import LinkRow from '../components/LinkRow';
import { useSubsystemOverview } from '../ono-cloud/OnoKitchen';
import KitchenHistory from '../components/KitchenHistory';
import ControlPanel from './ControlPanel';
import SimplePage from '../components/SimplePage';
import { useCloud, useCloudReducer } from '../cloud-core/KiteReact';
import RestaurantReducer from '../logic/RestaurantReducer';
import { useNavigation } from '../navigation-hooks/Hooks';

function Subsystems() {
  const subsystems = useSubsystemOverview();
  const navigation = useNavigation();
  return (
    <RowSection>
      {subsystems.map(system => (
        <LinkRow
          key={system.name}
          onPress={() => {
            navigation.navigate({
              routeName: 'KitchenEngSub',
              params: { system: system.name },
            });
          }}
          icon={system.icon}
          title={system.name}
          rightIcon={
            system.noFaults === null ? '' : system.noFaults ? '👍' : '🚨'
          }
        />
      ))}
    </RowSection>
  );
}

// function LogView() {
//   const [logs, dispatchLogs] = useReducer((state, action) => {
//     if (action.event) {
//       return [...state, action.event];
//     }
//     if (action.clear) {
//       return [];
//     }
//     return state;
//   }, []);
//   const cloud = useCloud();
//   const kitchenState = cloud.get('KitchenState');
//   const performLog = event => dispatchLogs({ event });
//   useEffect(() => {
//     cloud.isConnected.subscribe(isConn => {
//       performLog({
//         message: isConn ? 'Connected to Server' : 'Disconnected from Server',
//       });
//     });
//   }, [cloud.isConnected, kitchenState]);
//   return (
//     <ScrollView style={{ flex: 1 }}>
//       <KitchenHistory />
//       <View style={{ padding: 40 }}>
//         {logs.map((log, index) => (
//           <Text style={{ fontSize: 28 }} key={index}>
//             {log.message}
//           </Text>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

function Panel() {
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActions',
    RestaurantReducer,
  );
  return (
    <ControlPanel
      restaurantState={restaurantState}
      restaurantDispatch={dispatch}
    />
  );
}

export default function KitchenEngScreen({ ...props }) {
  return (
    <SimplePage
      {...props}
      title="Kitchen Engineering"
      icon="🛠"
      footer={<Panel />}
    >
      <Subsystems />
    </SimplePage>
  );
}

KitchenEngScreen.navigationOptions = SimplePage.navigationOptions;
