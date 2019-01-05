import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Button from '../../components/Button';
import TextButton from '../../components/TextButton';
import { useOrderSummary } from '../../ono-cloud/OnoKitchen';
import Cart from '../../components/Cart';

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
    <ScrollView style={{}}>
      <TextButton
        title="cancel order"
        onPress={async () => {
          await summary.cancel();
          navigate('KioskHome');
        }}
      />
      <Cart summary={summary} />
      <Button
        title="checkout"
        onPress={() => {
          navigate('CollectName');
        }}
      />
    </ScrollView>
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
        backgroundColor: '#fff',
        shadowOffset: { width: -6, height: 0 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
      }}
    >
      <OrderPanel />
    </View>
  );
}
