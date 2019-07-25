import { getPaymentIntent } from '../stripe-server/Stripe';
import {
  companyConfigToBlendMenu,
  getOrderSummary,
  displayNameOfOrderItem,
  getSelectedIngredients,
  getItemCustomizationSummary,
} from '../logic/configLogic';

export default async function placeOrder(cloud, { orderId, paymentIntent }) {
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
  if (stripeIntentId) {
    stripeIntent = await getPaymentIntent(stripeIntentId);
  }
  let isOrderValid = false;
  if (stripeIntent && stripeIntent.amount === summary.total) {
    isOrderValid = true;
  } else if (summary.total === 0) {
    isOrderValid = true;
  }
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
  console.log('confriming order..', confirmedOrder);

  if (!isOrderValid) {
    throw new Error('Could not verify payment intent! Order has failed.');
  }

  await cloud.get(`ConfirmedOrders/${orderId}`).putValue(confirmedOrder);

  await summary.items.reduce(async (last, item, index) => {
    await last;
    if (item.type !== 'blend') {
      return;
    }
    const { menuItemId } = item;
    const menuItem = blends.find(b => b.id === menuItemId);
    const { ingredients } = getSelectedIngredients(
      menuItem,
      item,
      companyConfig,
    );

    const KitchenSlots = companyConfig.baseTables.KitchenSlots;
    const KitchenSystems = companyConfig.baseTables.KitchenSystems;
    const requestedFills = ingredients.map(ing => {
      const kitchenSlotId = Object.keys(KitchenSlots).find(slotId => {
        const slot = KitchenSlots[slotId];
        return slot.Ingredient && ing.id === slot.Ingredient[0];
      });
      const kitchenSlot = kitchenSlotId && KitchenSlots[kitchenSlotId];
      if (!kitchenSlot) {
        return {
          ingredientId: ing.id,
          ingredientName: ing.Name,
          invalid: 'NoSlot',
        };
      }
      const kitchenSystemId =
        kitchenSlot.KitchenSystem && kitchenSlot.KitchenSystem[0];
      const kitchenSystem = kitchenSystemId && KitchenSystems[kitchenSystemId];
      if (!kitchenSystem) {
        return {
          ingredientId: ing.id,
          ingredientName: ing.Name,
          slotId: kitchenSlotId,
          invalid: 'NoSystem',
        };
      }
      return {
        amount: ing.amount,
        amountVolumeRatio: ing.amountVolumeRatio,
        ingredientId: ing.id,
        ingredientName: ing.Name,
        ingredientColor: ing.Color,
        ingredientIcon: ing.Icon,
        slotId: kitchenSlotId,
        systemId: kitchenSystemId,
        slot: kitchenSlot.Slot,
        system: kitchenSystem.FillSystemID,
        invalid: null,
      };
    });
    const invalidFills = requestedFills.filter(f => !!f.invalid);
    if (invalidFills.length) {
      console.error('Invalid Fills:', invalidFills);
      throw new Error('Invalid fills!');
    }
    const orderName =
      order.orderName.firstName + ' ' + order.orderName.lastName;
    const blendName = displayNameOfOrderItem(item, item.menuItem);
    const itemForKitchen = {
      id: orderId + item.id,
      orderItemId: item.id,
      orderId,
      name: orderName,
      blendName,
      fills: requestedFills,
    };
    console.log('NEW BLEND ORDER!', itemForKitchen);
    await cloud.get('RestaurantActions').putTransactionValue({
      type: 'QueueTask',
      item: itemForKitchen,
    });
  }, Promise.resolve());

  return {};
}
