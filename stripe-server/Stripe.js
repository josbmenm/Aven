import { getSecretConfig } from '../aven-web/config';
import { log } from '../logger/logger';
const Stripe = require('stripe');
const TOKEN = getSecretConfig('STRIPE_TOKEN');
const LIVE_TOKEN = getSecretConfig('STRIPE_LIVE_TOKEN');
const stripeDevelopment = !!TOKEN && Stripe(TOKEN);
const stripeProduction = !!LIVE_TOKEN && Stripe(LIVE_TOKEN);

log('StripeStartup', {
  hasDev: !!stripeDevelopment,
  hasLive: !!stripeProduction,
});

function getStripe(isLive) {
  if (isLive) {
    if (!stripeProduction) {
      throw new Error('No Stripe production token');
    }
    return stripeProduction;
  }
  if (!stripeDevelopment) {
    throw new Error('No Stripe dev token');
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
  const source =
    paymentIntent.source &&
    (await stripe.sources.retrieve(paymentIntent.source));
  const charge = paymentIntent.charges.data[0];
  const cardFingerprint =
    charge.payment_method_details.card_present.fingerprint;
  return {
    ...paymentIntent,
    cardFingerprint,
    sourceId: paymentIntent.source,
    source,
  };
}

export async function refundPaymentIntent(paymentIntent) {
  log('WillRefundPayment', { paymentIntent });
  const charge = paymentIntent.charges.data[0];

  const stripe = getStripe(paymentIntent.livemode);

  const refund = await stripe.refunds.create({
    charge: charge.id,
  });
  log('DidRefundPayment', { paymentIntent, charge, refund });
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
