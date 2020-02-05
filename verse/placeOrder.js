import { getPaymentIntent } from '../stripe-server/Stripe';
import { log, error } from '../logger/logger';
import {
  companyConfigToBlendMenu,
  getOrderSummary,
  displayNameOfOrderItem,
  getItemCustomizationSummary,
  getFillsOfOrderItem,
  getNewBlendTask,
} from '../logic/configLogic';
import fetch from 'node-fetch';
import cuid from 'cuid';

export default async function placeOrder(
  cloud,
  companyConfigStream,
  restaurantConfigStream,
  { isLive, order, paymentIntent },
) {
  const orderId = cuid();
  log('AttemptPlaceOrder', { isLive, order, orderId, paymentIntent });
  const companyConfigState = await companyConfigStream.load();
  const companyConfig = companyConfigState.value;
  const restaurantConfigState = await restaurantConfigStream.load();
  const restaurantConfig = restaurantConfigState.value;
  const isCateringMode =
    restaurantConfig && restaurantConfig.mode === 'catering';

  const blends = companyConfigToBlendMenu(companyConfig);
  const summary = getOrderSummary(order, companyConfig);
  if (!summary) {
    error('PlaceOrderContextFailure', {
      summary,
      orderId,
      paymentIntent,
      order,
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
    try {
      stripeIntent = await getPaymentIntent(stripeIntentId, isLive);
      log('LookupStripeIntent', {
        stripeIntent,
        stripeIntentId,
        orderId,
      });
    } catch (err) {
      error('LookupStripeIntentFailure', {
        code: err.message,
        paymentIntent,
        orderId,
      });
    }
  }
  let isOrderValid = false;
  if (isCateringMode) {
    isOrderValid = true;
  } else if (stripeIntent && stripeIntent.amount === summary.total) {
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
      promoDoc
        .transact(p => ({
          ...p,
          uses: [...(p.uses || []), { orderId, time: Date.now() }],
        }))
        .catch(err => {
          error('PromoCodeVerificationUseWriteFailure', {
            code: err.message,
            promoValue,
            promoCode: promo.promoCode,
          });
        });
    } else {
      error('PromoCodeVerificationFailure', {
        promo,
        error: 'Unknown context type',
        orderId,
      });
      throw new Error('PromoCodeVerification');
    }
  }
  const orderName = order.orderName.firstName + ' ' + order.orderName.lastName;
  const allTasks = summary.items
    .filter(i => i.type === 'blend')
    .map(item => {
      const { menuItemId } = item;
      const menuItem = blends.find(b => b.id === menuItemId);
      const fills = getFillsOfOrderItem(menuItem, item, companyConfig);

      const blendName = displayNameOfOrderItem(item, item.menuItem);
      return [...Array(item.quantity)].map((_, quantityIndex) =>
        getNewBlendTask(
          item.menuItem,
          fills,
          orderName,
          {
            quantityIndex,
            blendName,
            orderItemId: item.id,
            orderId,
          },
          companyConfig,
        ),
      );
    });
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
    confirmedTime: Date.now(),
    subTotalDollars: subTotal / 100,
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
    isCateringMode,
  };

  if (!isOrderValid) {
    // oh its not valid.. whatever, right now!
    error('OrderValidationFailure', {
      confirmedOrder,
    });

    // error('OrderValidationError', {
    //   isOrderValid,
    //   stripeIntent,
    //   orderId,
    //   stripeIntentId,
    //   order: confirmedOrder,
    // });
    // throw new Error('Could not verify payment intent! Order has failed.');
  }

  await cloud.get(`Orders/${orderId}`).putTransactionValue({
    type: 'PlaceOrder',
    orderId: confirmedOrder.orderId,
    order: confirmedOrder,
  });

  orderTasks.forEach(task => log('OrderTask', { task, orderId }));
  log('OrderTasksPlaced', { orderId, taskCount: orderTasks.length });
  log('OrderPlacedSuccess', confirmedOrder);

  const foodItems = summary.items.filter(i => i.type === 'food');
  if (foodItems.length) {
    let message = `Food has been ordered by ${orderName}: \n`;
    foodItems.forEach(item => {
      message += ` - ${item.quantity}x ${item.menuItem.Name} \n`;
    });
    message += `(order id: ${orderId})`;
    fetch(
      'https://hooks.slack.com/services/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',
      {
        method: 'post',
        body: JSON.stringify({ text: message }),
        headers: {
          encoding: 'application/json',
        },
      },
    )
      .then(() => {
        console.log('food notified successfully');
      })
      .catch(err => {
        console.log('food err ', err);
      });
  }

  return {
    orderId,
    confirmedOrder,
  };
}
