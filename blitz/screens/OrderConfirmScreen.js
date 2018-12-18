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
import OrderSummary from '../../components/OrderSummary';

function OrderConfirmWithPayment({
  paymentRequest,
  paymentError,
  isPaymentReady,
  isPaymentComplete,
  paymentActivityLog,
  navigation,
}) {
  const { confirmOrder } = useOrder();
  const summary = useOrderSummary();

  return (
    <GenericPage>
      <OrderSummary summary={summary} />
      <Button
        title="Pay Now"
        onPress={async () => {
          await confirmOrder();
          paymentRequest(100, 'Ono Blends');
        }}
      />
      <Button
        title="Skip Payment (TEST ONLY)"
        onPress={async () => {
          await confirmOrder();
          navigation.navigate('OrderComplete');
        }}
      />
    </GenericPage>
  );
}

const OrderConfirm = paymentContainer(OrderConfirmWithPayment);

export default OrderConfirm;
