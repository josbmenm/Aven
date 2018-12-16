import React, { Component, useEffect } from 'react';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';
import Button from '../../components/Button';
import { Text, View } from 'react-native';
import {
  withMenu,
  useOrder,
  useOrderSummary,
} from '../../ono-cloud/OnoKitchen';
import useObservable from '../../aven-cloud/useObservable';
import { paymentContainer } from '../Payments';
import { useNavigation } from '../../navigation-hooks/Hooks';
import useEmptyOrderEscape from '../useEmptyOrderEscape';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});
function RecieptRow({ label, amount, emphasize }) {
  const textStyle = { fontSize: 32, color: emphasize ? '#111' : '#333' };
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1 }}>
        <Text style={textStyle}>{label}</Text>
      </View>
      <View style={{ width: 180 }}>
        <Text style={textStyle}>{currency.format(amount)}</Text>
      </View>
    </View>
  );
}

function OrderItemRow({ item }) {
  return (
    <RecieptRow
      label={item.menuItem['Display Name']}
      amount={item.menuItem.Recipe['Sell Price']}
      emphasize
    />
  );
}

function Overview({ foodMenu, blendMenu }) {
  const { navigate } = useNavigation();
  const summary = useOrderSummary();
  useEmptyOrderEscape();

  // useEffect(
  //   () => {
  //     if (!summary) {
  //       navigate('KioskHome');
  //     }
  //   },
  //   [summary],
  // );
  console.log('ok fml', summary);
  if (!summary) {
    return null;
  }
  return (
    <View style={{ backgroundColor: 'white', padding: 30 }}>
      {summary.items.map(item => (
        <OrderItemRow item={item} />
      ))}
      <View style={{ height: 80 }} />
      <RecieptRow label="SubTotal" amount={summary.subTotal} />
      <RecieptRow label="Tax" amount={summary.tax} />
      <RecieptRow label="Total" amount={summary.total} emphasize />
    </View>
  );
}

function OrderConfirmWithPayment({
  paymentRequest,
  paymentError,
  isPaymentReady,
  isPaymentComplete,
  paymentActivityLog,
  navigation,
}) {
  const { submitOrder } = useOrder();
  return (
    <GenericPage>
      <Hero title="Review Order" />
      <Overview />
      <Button
        title="Pay Now"
        onPress={async () => {
          await submitOrder();
          paymentRequest(100, 'Ono Blends');
        }}
      />
      <Button
        title="Skip Payment (TEST ONLY)"
        onPress={async () => {
          await submitOrder();
          navigation.navigate('CollectName');
        }}
      />
    </GenericPage>
  );
}

const OrderConfirm = paymentContainer(OrderConfirmWithPayment);

export default OrderConfirm;
