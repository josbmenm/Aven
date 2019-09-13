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
      orderId,
    });
  }
  let isOrderValid = false;
  if (stripeIntent && stripeIntent.amount === summary.total) {
    isOrderValid = true;
  } else if (summary.total === 0) {
    isOrderValid = true;
  }

  if (promo) {
    // promo code verification
    if (promo.context.type === 'Seasonal') {
      // todo, verify seasonal promo using companyConfig.baseTables.PromoCodes[promo.context.id]
    } else if (promo.context.type === 'ThanksToken') {
      const promoDoc = cloud.get(`PromoCodes/${promo.promoCode}`);
      const promoState = await promoDoc.idAndValue.load();
      const promoValue = promoState.value;
      if (promoValue.uses && promoValue.uses.length >= 1) {
        error('PromoCodeVerificationFailure', {
          promo,
          error: 'Already Used Token',
          orderId,
        });
        throw new Error('PromoCodeVerification');
      }
      await promoDoc.transact(p => ({
        ...p,
        uses: [...(p.uses || []), { orderId, time: Date.now() }],
      }));
    } else {
      error('PromoCodeVerificationFailure', {
        promo,
        error: 'Unknown context type',
        orderId,
      });
      throw new Error('PromoCodeVerification');
    }
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
        blendColor: item.menuItem.Recipe.Color,
        blendProfile: item.menuItem.Recipe['Blend Profile'],
        fills,
      }));
    }),
  );
  const orderTasks = allTasks.flat(1);

  const itemsRollup = summary.items.map(i => {
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
  });

  const confirmedOrder = {
    ...order,
    subTotal,
    subTotalDollars,
    tax,
    total,
    totalDollars: total / 100,
    discountTotal,
    totalBeforeDiscount,
    taxRate,
    promo,
    items: itemsRollup,
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
      orderId,
      stripeIntentId,
      order: confirmedOrder,
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

  log('OrderTasksQueued', { orderTasks, orderId });
  log('OrderPlacedSuccess', confirmedOrder);

  return {};
}
