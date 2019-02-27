import React, { Component, useEffect } from 'react';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';
import Button from '../../components/Button';
import { Text, View } from 'react-native';
import { useOrder, useOrderSummary } from '../../ono-cloud/OnoKitchen';
import useObservable from '../../aven-cloud/useObservable';
import { useNavigation } from '../../navigation-hooks/Hooks';
import useEmptyOrderEscape from '../useEmptyOrderEscape';
import Receipt from '../../components/Receipt';
import { useCardPaymentCapture } from '../CardReader';
import OrderConfirmPage from '../components/OrderConfirmPage';

export default function OrderConfirmScreen({
  paymentRequest,
  paymentError,
  isPaymentReady,
  isPaymentComplete,
  paymentActivityLog,
  navigation,
  ...props
}) {
  const { confirmOrder, order } = useOrder();
  const summary = useOrderSummary();
  const paymentDetails = summary && {
    amount: Math.floor(summary.total * 100), // ugh.. we should really be using cents everywhere..
    description: 'Ono Blends',
  };
  function onPaymentComplete() {
    confirmOrder();
    navigation.navigate('Receipt', { orderId: order.getName() });
  }
  const { state } = useCardPaymentCapture(paymentDetails, {
    onPaymentComplete,
  });
  console.log('----', state);
  useEmptyOrderEscape();
  return (
    <OrderConfirmPage
      summary={summary}
      readerState={state}
      backBehavior={() => {
        cancelPayment();
        goBack();
      }}
      skipPayment={async () => {
        confirmOrder();
        navigation.navigate('Receipt', { orderId: order.getName() });
      }}
      {...props}
      navigation={navigation}
    />
  );
}

OrderConfirmScreen.navigationOptions = OrderConfirmPage.navigationOptions;
