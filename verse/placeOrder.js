import { getPaymentIntent } from '../stripe-server/Stripe';
import {
  companyConfigToBlendMenu,
  getOrderSummary,
  displayNameOfOrderItem,
  getItemCustomizationSummary,
  getFillsOfOrder,
} from '../logic/configLogic';
import cuid from 'cuid';

export default async function placeOrder(
  cloud,
  { isLive, orderId, paymentIntent },
) {
  const orderState = await cloud
    .get(`PendingOrders/${orderId}`)
    .idAndValue.load();
  const companyConfigState = await cloud.get('CompanyConfig').idAndValue.load();
  const companyConfig = companyConfigState.value;
  const order = orderState.value;

  const blends = companyConfigToBlendMenu(companyConfig);
  const summary = getOrderSummary(order, companyConfig);
  if (!summary) {
    console.error({
      summary,
      order,
      orderId,
      paymentIntent,
    });
    throw new Error('Invalid order summary retrieved!');
  }
  const {
    total,
    subTotal,
    tax,
    discountTotal,
    totalBeforeDiscount,
    taxRate,
    promo,
  } = summary;
  const stripeIntentId = paymentIntent && paymentIntent.stripeId;
  let stripeIntent = null;
  console.log('looking up ', stripeIntentId);
  if (stripeIntentId) {
    stripeIntent = await getPaymentIntent(stripeIntentId, isLive);
  }
  console.log('looking ', stripeIntent);
  let isOrderValid = false;
  if (stripeIntent && stripeIntent.amount === summary.total) {
    isOrderValid = true;
  } else if (summary.total === 0) {
    isOrderValid = true;
  }
  console.log('comparison', { summary, stripeIntent, paymentIntent });
  const confirmedOrder = {
    ...order,
    subTotal,
    tax,
    total,
    discountTotal,
    totalBeforeDiscount,
    taxRate,
    promo,
    items: summary.items.map(i => {
      const customizationSummary = getItemCustomizationSummary(i);
      const {
        itemPrice,
        recipeBasePrice,
        sellPrice,
        quantity,
        id,
        type,
        menuItemId,
        customization,
      } = i;
      return {
        displayName: displayNameOfOrderItem(i, i.menuItem),
        itemPrice,
        recipeBasePrice,
        sellPrice,
        quantity,
        id,
        type,
        menuItemId,
        customization,
        customizationSummary,
      };
    }),
    id: orderId,
    stripeIntentId,
    stripeIntent,
    isOrderValid,
  };

  if (!isOrderValid) {
    throw new Error('Could not verify payment intent! Order has failed.');
  }

  await cloud.get(`ConfirmedOrders/${orderId}`).putValue(confirmedOrder);

  const allTasks = await Promise.all(
    summary.items.map(async item => {
      if (item.type !== 'blend') {
        return;
      }
      const { menuItemId } = item;
      const menuItem = blends.find(b => b.id === menuItemId);
      const fills = getFillsOfOrder(menuItem, item, companyConfig);
      const orderName =
        order.orderName.firstName + ' ' + order.orderName.lastName;
      const blendName = displayNameOfOrderItem(item, item.menuItem);
      return [...Array(item.quantity)].map((_, quantityIndex) => ({
        id: cuid(),
        quantityIndex,
        orderItemId: item.id,
        orderId,
        name: orderName,
        blendName,
        fills,
      }));
    }),
  );
  const tasks = allTasks.flat(1);
  await cloud.get('RestaurantActions').putTransactionValue({
    type: 'QueueTasks',
    tasks,
  });

  console.log(`Order Placed. Queued ${tasks.length} tasks for kitchen.`);

  return {};
}
