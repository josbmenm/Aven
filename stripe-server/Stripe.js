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

  return {};
};

export async function getPaymentIntent(intentId) {
  const paymentIntent = await stripe.paymentIntents.retrieve(intentId);

  const source = await stripe.sources.retrieve(paymentIntent.source);

  // const charges = await Promise.all(
  //   paymentIntent.charges.data.map(async chargeId => {
  //     return await stripe.charges.retrieve(chargeId);
  //   }),
  // );

  return {
    ...paymentIntent,
    sourceId: paymentIntent.source,
    source,
    // charges,
    // chargesMeta: paymentIntent.charges,
  };
}

export async function refundCharge(charge) {
  console.log('STRIPE REFUNDING: ', charge);
  const refund = await stripe.refunds.create({
    charge: charge.id,
  });
  console.log('STRIPE REFUNDED: ', refund);
  return refund;
}
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
