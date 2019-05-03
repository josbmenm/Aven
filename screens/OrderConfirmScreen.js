import React from 'react';
import { useOrder, useOrderSummary } from '../ono-cloud/OnoKitchen';
import useEmptyOrderEscape from './useEmptyOrderEscape';
import { useCardPaymentCapture } from '../card-reader/CardReader';
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
