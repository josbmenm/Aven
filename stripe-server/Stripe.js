import { getSecretConfig } from '../aven-web/config';
const Stripe = require('stripe');
const TOKEN = getSecretConfig('STRIPE_TOKEN');
const stripe = Stripe(TOKEN);

export const getConnectionToken = async action => {
  const result = await stripe.terminal.connectionTokens.create();
  return result;
};

export const capturePayment = async action => {
  const { paymentIntentId } = action;

  await stripe.paymentIntents.capture(paymentIntentId);

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const source = await stripe.sources.retrieve(paymentIntent.source);

  console.log(
    'capturePayment paymentIntent!',
    paymentIntent.amount_received,
    paymentIntentId,
    paymentIntent.source,
    source.card_present && source.card_present.fingerprint,
  );

  return {};
};

export async function handleStripeAction(action) {
  switch (action.type) {
    case 'StripeGetConnectionToken':
      return getConnectionToken(action);
    case 'StripeCapturePayment':
      return capturePayment(action);
    default:
      return undefined;
  }
}
