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
  const order = cloud.get(`ConfirmedOrders/${action.orderId}`);
  const orderState = await order.idAndValue.load();

  if (!orderState.value) {
    throw new Error('Cannot find this order ' + action.orderId);
  }
  if (orderState.value.refund) {
    throw new Error('Order value is already refunded');
  }
  if (!orderState.value.stripeIntent) {
    throw new Error('Cannot refund without a stripe payment intent');
  }
  const refund = await refundPaymentIntent(orderState.value.stripeIntent);
  const newOrder = {
    ...orderState.value,
    refundTime: Date.now(),
    refund,
  };
  order.putValue(newOrder);
  log('DidRefundOrder', { order: newOrder });
  return newOrder;
}
