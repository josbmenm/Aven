import React from 'react';
import { useOrder, useOrderSummary } from '../ono-cloud/OrderContext';
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
  const [error, setError] = React.useState(null);
  function handleCaughtError(e) {
    setError(e);
    return true;
  }
  const handleError = useAsyncError(handleCaughtError);
  const summary = useOrderSummary();
  async function handleCompletion(paymentIntent) {
    await confirmOrder(paymentIntent);
    setTimeout(() => {
      navigation.navigate('Receipt', { orderId: order.getName() });
    }, 1000);
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
  let skipOnceRef = React.useRef(false);
  async function handleOnceSkippedPayment() {
    if (skipOnceRef.current) return;
    skipOnceRef.current = true;
    try {
      await handleSkippedPayment();
    } catch (e) {
      skipOnceRef.current = false;
      throw e;
    }
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
        await handleError(handleOnceSkippedPayment());
      }}
      navigation={navigation}
      {...props}
    />
  );
}

OrderConfirmScreen.navigationOptions = OrderConfirmPage.navigationOptions;
