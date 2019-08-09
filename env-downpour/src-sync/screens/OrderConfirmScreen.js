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
  paymentActivityLog,
  navigation,
  ...props
}) {
  const { confirmOrder, order } = useOrder();
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [error, setError] = React.useState(null);
  function handleCaughtError(e) {
    setError(e);
    return true;
  }
  const handleError = useAsyncError(handleCaughtError);
  const summary = useOrderSummary();
  console.log(JSON.stringify(summary));
  async function handleCompletion(paymentIntent) {
    setIsCompleted(true);
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
  const {
    state,
    paymentSuccessful,
    paymentCompleted,
    paymentErrorMessage,
    displayMessage,
  } = useCardPaymentCapture(paymentDetails);
  useEmptyOrderEscape();
  async function handleSkippedPayment() {
    await confirmOrder();
    navigation.navigate('Receipt', { orderId: order.getName() });
  }
  return (
    <OrderConfirmPage
      summary={summary}
      paymentState={state}
      paymentSuccessful={paymentSuccessful}
      paymentCompleted={paymentCompleted}
      paymentErrorMessage={paymentErrorMessage}
      paymentDisplayMessage={displayMessage}
      error={error}
      backBehavior={() => {
        cancelPayment();
        goBack();
      }}
      skipPayment={async () => {
        handleError(handleSkippedPayment());
      }}
      navigation={navigation}
      {...props}
    />
  );
}

OrderConfirmScreen.navigationOptions = OrderConfirmPage.navigationOptions;
