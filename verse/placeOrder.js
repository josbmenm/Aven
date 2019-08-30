import { getPaymentIntent } from '../stripe-server/Stripe';
import { log, error } from '../logger/logger';
import {
  companyConfigToBlendMenu,
  getOrderSummary,
  displayNameOfOrderItem,
  getItemCustomizationSummary,
  getFillsOfOrderItem,
} from '../logic/configLogic';
import cuid from 'cuid';

export default async function placeOrder(
  cloud,
  { isLive, orderId, paymentIntent },
) {
  log('AttemptPlaceOrder', { isLive, orderId, paymentIntent });
  const orderState = await cloud
    .get(`PendingOrders/${orderId}`)
    .idAndValue.load();
  const companyConfigState = await cloud.get('CompanyConfig').idAndValue.load();
  const companyConfig = companyConfigState.value;
  const order = orderState.value;

  const blends = companyConfigToBlendMenu(companyConfig);
  const summary = getOrderSummary(order, companyConfig);
  if (!summary) {
    error('PlaceOrderContextFailure', {
      summary,
      orderId,
      paymentIntent,
      order: orderState,
      companyConfigId: companyConfigState.id,
    });
    throw new Error('Invalid order summary retrieved!');
  }
  log('PlaceOrderContext', {
    ...summary,
    companyConfigId: companyConfigState.id,
    menu: null,
    summary,
    order,
    orderId,
    paymentIntent,
  });
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
  if (stripeIntentId) {
    stripeIntent = await getPaymentIntent(stripeIntentId, isLive);
    log('LookupStripeIntent', {
      stripeIntent,
      stripeIntentId,
      ...summary,
      menu: null,
    });
  }
  let isOrderValid = false;
  if (stripeIntent && stripeIntent.amount === summary.total) {
    isOrderValid = true;
  } else if (summary.total === 0) {
    isOrderValid = true;
  }

  const allTasks = await Promise.all(
    summary.items.map(async item => {
      if (item.type !== 'blend') {
        return;
      }
      const { menuItemId } = item;
      const menuItem = blends.find(b => b.id === menuItemId);
      const fills = getFillsOfOrderItem(menuItem, item, companyConfig);
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
  const orderTasks = allTasks.flat(1);

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
    orderId, // yes this is redundant.. if anything, we should remove the ambiguous `id`
    stripeIntentId,
    stripeIntent,
    isOrderValid,
    orderTasks,
  };

  if (!isOrderValid) {
    error('OrderValidationError', {
      isOrderValid,
      stripeIntent,
      ...summary,
      orderId,
      stripeIntentId,
      menu: null,
    });
    throw new Error('Could not verify payment intent! Order has failed.');
  }

  await cloud.get(`ConfirmedOrders/${orderId}`).putValue(confirmedOrder);
  await cloud.get('CompanyActivity').putTransactionValue({
    type: 'KioskOrder',
    confirmedOrder,
  });
  await cloud.get('RestaurantActions').putTransactionValue({
    type: 'QueueTasks',
    tasks: orderTasks,
  });

  log('OrderTasksQueued', { tasks });
  log('OrderPlacedSuccess', confirmedOrder);

  return {};
}
