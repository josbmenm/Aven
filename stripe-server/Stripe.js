import { getSecretConfig } from '../aven-web/config';
const Stripe = require('stripe');
const TOKEN = getSecretConfig('STRIPE_TOKEN');
const LIVE_TOKEN = getSecretConfig('STRIPE_LIVE_TOKEN');
const stripeDevelopment = Stripe(TOKEN);
const stripeProduction = !!LIVE_TOKEN && Stripe(LIVE_TOKEN);

function getStripe(isLive) {
  if (isLive) {
    if (!stripeProduction) {
      throw new Error('No Stripe production token');
    }
    return stripeProduction;
  }
  return stripeDevelopment;
}

export const getConnectionToken = async action => {
  const stripe = getStripe(action.isLive);
  const result = await stripe.terminal.connectionTokens.create();
  return result;
};

export const capturePayment = async action => {
  const { paymentIntentId } = action;
  const stripe = getStripe(action.isLive);

  await stripe.paymentIntents.capture(paymentIntentId);

  return {};
};

export async function getPaymentIntent(intentId, isLive) {
  const stripe = getStripe(isLive);
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
  const stripe = getStripe(charge.isLive);
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
