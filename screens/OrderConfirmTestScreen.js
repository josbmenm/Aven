import React from 'react';
import { useCardPaymentCapture } from '../card-reader/CardReader';
import OrderConfirmPage from '../components/OrderConfirmPage';
import useAsyncError from '../react-utils/useAsyncError';

const exampleOrderSummary = require('./exampleOrderSummary.json');

export default function OrderConfirmTestScreen({ navigation, ...props }) {
  const [error, setError] = React.useState(null);
  function handleCaughtError(e) {
    setError(e);
    return true;
  }
  const handleError = useAsyncError(handleCaughtError);
  const summary = { ...exampleOrderSummary };
  async function handleCompletion(paymentIntent) {
    navigation.goBack();
  }
  const paymentDetails =
    summary && summary.total > 0
      ? {
          amount: summary.total,
          description: 'Ono Blends',
          context: { id: 'uhhh' },
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
  async function handleSkippedPayment() {}
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
        navigation.goBack();
      }}
      skipPayment={async () => {
        handleError(handleSkippedPayment());
      }}
      navigation={navigation}
      {...props}
    />
  );
}

OrderConfirmTestScreen.navigationOptions = OrderConfirmPage.navigationOptions;
