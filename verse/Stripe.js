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

  return {};
};
