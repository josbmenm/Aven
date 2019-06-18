import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import InventoryScreen from './InventoryScreen';
import SequencerScreen from './SequencerScreen';
import ManualControlScreen from './ManualControlScreen';
import OrdersScreen from './OrdersScreen';
import DeviceManagerScreen from './DeviceManagerScreen';
import RestaurantStatusScreen from './RestaurantStatusScreen';
import { boldPrimaryFontFace, monsterra } from '../components/Styles';

const TABS = [
  { key: 'inventory', Screen: InventoryScreen, title: 'Inventory' },
  { key: 'manual', Screen: ManualControlScreen, title: 'Manual' },
  { key: 'sequencer', Screen: SequencerScreen, title: 'Sequencer' },
  { key: 'orders', Screen: OrdersScreen, title: 'Orders' },
  { key: 'status', Screen: RestaurantStatusScreen, title: 'Status' },
  { key: 'devices', Screen: DeviceManagerScreen, title: 'Devices' },
];

export default function EngDashboardScreen() {
  let [index, setIndex] = React.useState(0);
  const tab = TABS[index];
  const { key, Screen } = tab;
  return (
    <View style={{ flex: 1 }}>
      <Screen />
      <View style={{ height: 50, flexDirection: 'row' }}>
        {TABS.map((tab, tabIndex) => {
          const isActive = tab.key === key;
          return (
            <View
              key={tab.key}
              style={{
                flex: 1,
                backgroundColor: isActive ? monsterra : 'white',
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setIndex(tabIndex);
                }}
                style={{ padding: 10, alignSelf: 'stretch' }}
              >
                <Text
                  style={{
                    ...boldPrimaryFontFace,
                    fontSize: 20,
                    color: isActive ? 'white' : monsterra,
                    textAlign: 'center',
                  }}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}
