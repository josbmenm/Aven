import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { useOrderSummary } from '../../ono-cloud/OnoKitchen';
import OrderSummary from '../../components/OrderSummary';
import SummonHost from './SummonHost';

import { useNavigation } from '../../navigation-hooks/Hooks';
import useEmptyOrderEscape from '../useEmptyOrderEscape';

function OrderPanel() {
  const { navigate } = useNavigation();
  const summary = useOrderSummary();
  useEmptyOrderEscape();

  if (!summary) {
    return null;
  }
  return (
    <View style={{}}>
      <OrderSummary summary={summary} />
      <SummonHost />
      <Button
        title="Checkout"
        onPress={() => {
          navigate('CollectName');
        }}
      />
      <Button
        title="Cancel Order"
        onPress={async () => {
          await summary.cancel();
          navigate('KioskHome');
        }}
      />
    </View>
  );
}

export default function OrderSidebar() {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 300,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderLeftColor: '#aaa',
      }}
    >
      <OrderPanel />
    </View>
  );
}
