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
  function onCompletion(paymentIntent) {
    confirmOrder(paymentIntent);
    navigation.navigate('Receipt', { orderId: order.getName() });
  }

  const paymentDetails =
    summary && summary.total > 0
      ? {
          amount: summary.total,
          description: 'Ono Blends',
          context: { id: order && order.getName() },
          onCompletion,
        }
      : undefined;
  const { state } = useCardPaymentCapture(paymentDetails);
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
