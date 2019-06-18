import { refundCharge } from '../stripe-server/Stripe';

export default async function refundOrder({
  cloud,
  smsAgent,
  emailAgent,
  action,
  logger,
}) {
  const order = cloud.get(`ConfirmedOrders/${action.orderId}`);
  const orderValue = await order.loadValue();
  if (!orderValue) {
    throw new Error('Cannot find this order ' + action.orderId);
  }
  if (orderValue.refund) {
    throw new Error('Order value is already refunded');
  }
  if (!orderValue.stripeIntent) {
    throw new Error('Cannot refund without a stripe payment intent');
  }
  const refund = await refundCharge(orderValue.stripeIntent.charges.data[0]);
  const newOrder = {
    ...orderValue,
    refundTime: Date.now(),
    refund,
  };
  order.put(newOrder);
  console.log('REFUNDING', newOrder);
  return newOrder;
}
