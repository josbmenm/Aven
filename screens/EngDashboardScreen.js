import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import InventoryScreen from './InventoryScreen';

const TABS = [{ key: 'inventory', Screen: InventoryScreen }];

export default function EngDashboardScreen() {
  let [index, setIndex] = React.useState(0);
  const tab = TABS[index];
  const { key, Screen } = tab;
  return (
    <View style={{ flex: 1 }}>
      <Screen />
      <View style={{ height: 50 }}>
        {TABS.map((tab, tabIndex) => {
          const isActive = tab.key === key;
          return (
            <View
              key={tab.key}
              style={{ backgroundColor: isActive ? 'blue' : 'white' }}
            >
              <TouchableWithoutFeedback
                onPress={() => {
                  setIndex(tabIndex);
                }}
              >
                <Text>{key}</Text>
              </TouchableWithoutFeedback>
            </View>
          );
        })}
      </View>
    </View>
  );
}
