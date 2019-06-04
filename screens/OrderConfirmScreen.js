import React from 'react';
import { useOrder, useOrderSummary } from '../ono-cloud/OnoKitchen';
import useEmptyOrderEscape from './useEmptyOrderEscape';
import { useCardPaymentCapture } from '../card-reader/CardReader';
import OrderConfirmPage from '../components/OrderConfirmPage';
import useAsyncError from '../react-utils/useAsyncError';

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
  const [error, setError] = React.useState(null);
  function handleCaughtError(e) {
    setError(e);
    return true;
  }
  const handleError = useAsyncError(handleCaughtError);
  const summary = useOrderSummary();
  async function handleCompletion(paymentIntent) {
    await confirmOrder(paymentIntent);
    navigation.navigate('Receipt', { orderId: order.getName() });
  }
  const paymentDetails =
    summary && summary.total > 0
      ? {
          amount: summary.total,
          description: 'Ono Blends',
          context: { id: order && order.getName() },
          onCompletion: paymentIntent =>
            handleError(handleCompletion(paymentIntent)),
        }
      : undefined;
  const { state } = useCardPaymentCapture(paymentDetails);
  useEmptyOrderEscape();
  async function handleSkippedPayment() {
    await confirmOrder();
    navigation.navigate('Receipt', { orderId: order.getName() });
  }
  return (
    <OrderConfirmPage
      summary={summary}
      readerState={state}
      error={error}
      backBehavior={() => {
        cancelPayment();
        goBack();
      }}
      skipPayment={async () => {
        handleError(handleSkippedPayment());
      }}
      {...props}
      navigation={navigation}
    />
  );
}

OrderConfirmScreen.navigationOptions = OrderConfirmPage.navigationOptions;
