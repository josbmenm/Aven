import React from 'react';
import { View, Text } from 'react-native';
import useCloud from '../cloud-core/useCloud';
import useObservable from '../cloud-core/useObservable';
import { prettyShadow } from './Styles';

function TransactionHistory({ value }) {
  const txValue = useObservable(value.observeValue);
  return (
    <View style={{ ...prettyShadow, backgroundColor: 'white' }}>
      {txValue &&
        txValue.map((tx, index) => {
          let logLine = `${tx.type} - `;
          if (tx.subsystem) {
            logLine += `${tx.subsystem} - `;
          }
          if (tx.pulse && tx.pulse.length) {
            logLine += ` Pulse: ${tx.pulse.join()}`;
          }
          if (tx.values && Object.keys(tx.values).length) {
            logLine += ` Values: ${Object.keys(tx.values)
              .map(k => `${k}:${tx.values[k]}`)
              .join()}`;
          }
          return (
            <Text style={{ padding: 8 }} key={index}>
              {logLine}
            </Text>
          );
        })}
    </View>
  );
}

export default function KitchenHistory({ restaurantState, dispatch }) {
  return null;
  const cloud = useCloud();
  return <TransactionHistory value={cloud.get('KitchenLog')} />;
}
