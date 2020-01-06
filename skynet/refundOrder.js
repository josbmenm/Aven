import { refundPaymentIntent } from '../stripe-server/Stripe';
import { log } from '../logger/logger';

export default async function refundOrder({
  cloud,
  smsAgent,
  emailAgent,
  action,
  logger,
}) {
  log('WillRefundOrder', { orderId: action.orderId });
  const orderActions = cloud.get(`Orders/${action.orderId}`);
  const orderState = await cloud
    .get(`OrderState/${action.orderId}`)
    .idAndValue.load();

  if (!orderState || !orderState.value) {
    throw new Error('Cannot find this order ' + action.orderId);
  }
  if (orderState.value.refund) {
    throw new Error('Order value is already refunded');
  }
  if (!orderState.value.stripeIntent) {
    throw new Error('Cannot refund without a stripe payment intent');
  }
  const refund = await refundPaymentIntent(orderState.value.stripeIntent);
  const refundTime = Date.now();
  await orderActions.putTransactionValue({
    type: 'PaymentRefund',
    refundTime: Date.now(),
    refund,
  });
  const newOrder = { ...orderState.value, refundTime, refund };
  log('DidRefundOrder', { order: newOrder });
  return newOrder;
}
