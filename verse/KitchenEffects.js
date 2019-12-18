export default function computeSideEffects(kitchenState, restaurantState) {
  if (!kitchenState.isPLCConnected) {
    return [];
  }
  const {
    System_FreezerTemp_READ,
    System_BevTemp_READ,
    System_YogurtZoneTemp_READ,
    Denester_DispensedSinceLow_READ,
    Delivery_Bay0CupPresent_READ,
    System_WasteWaterFull_READ,
    System_FreshWaterAboveLow_READ,
  } = kitchenState;
  const foodMonitoring = {
    isBeverageCold: System_BevTemp_READ <= 41,
    isFreezerCold: System_FreezerTemp_READ <= 5,
    isPistonCold: System_YogurtZoneTemp_READ <= 41,
  };
  const lastMonitoredState = restaurantState.foodMonitoring || {};

  const sideEffects = [];
  if (
    Object.entries(foodMonitoring).find(
      ([monitorKey, monitorValue]) =>
        monitorValue !== lastMonitoredState[monitorKey],
    )
  ) {
    sideEffects.push({ type: 'SetFoodMonitoring', foodMonitoring });
  }

  if (restaurantState.isAutoRunning) {
    const faultMuting = restaurantState.faultMuting || {};
    if (!foodMonitoring.isBeverageCold && !faultMuting.bevTemp) {
      sideEffects.push({
        type: 'SetRestaurantFault',
        restaurantFaultType: 'BevTemp',
        requiresAck: true,
        params: { temp: System_BevTemp_READ },
      });
    }
    if (!foodMonitoring.isFreezerCold && !faultMuting.freezerTemp) {
      sideEffects.push({
        type: 'SetRestaurantFault',
        restaurantFaultType: 'FreezerTemp',
        requiresAck: true,
        params: { temp: System_FreezerTemp_READ },
      });
    }
    if (!foodMonitoring.isPistonCold && !faultMuting.pistonTemp) {
      sideEffects.push({
        type: 'SetRestaurantFault',
        restaurantFaultType: 'PistonTemp',
        requiresAck: true,
        params: { temp: System_YogurtZoneTemp_READ },
      });
    }
    if (System_WasteWaterFull_READ && !faultMuting.wasteFull) {
      sideEffects.push({
        type: 'SetRestaurantFault',
        restaurantFaultType: 'WasteFull',
      });
    }
    if (!System_FreshWaterAboveLow_READ && !faultMuting.waterEmpty) {
      sideEffects.push({
        type: 'SetRestaurantFault',
        restaurantFaultType: 'WaterEmpty',
      });
    }
  }
  if (restaurantState.delivery0 && !Delivery_Bay0CupPresent_READ) {
    sideEffects.push({ type: 'ClearDeliveryBay', bayId: 'delivery0' });
  }

  if (restaurantState.delivery1 && !kitchenState.Delivery_Bay1CupPresent_READ) {
    sideEffects.push({ type: 'ClearDeliveryBay', bayId: 'delivery1' });
  }
  // const willPassToBlender =
  //   restaurantState.fill && restaurantState.fill.willPassToBlender;
  // const mayBePassingToBlender =
  //   !!willPassToBlender && Date.now() < willPassToBlender + 60000;
  // if (
  //   (restaurantState.blend == null || restaurantState.blend === 'dirty') &&
  //   kitchenState.BlendSystem_HasCup_READ &&
  //   !mayBePassingToBlender
  // ) {
  //   sideEffects.push({ type: 'ObserveUnknownBlenderCup' });
  // }
  // const willPassToDelivery =
  //   restaurantState.blend && restaurantState.blend.willPassToDelivery;
  // const mayBePassingToDelivery =
  //   !!willPassToDelivery && Date.now() < willPassToDelivery + 60000;
  // if (
  //   restaurantState.delivery == null &&
  //   kitchenState.Delivery_ArmHasCup_READ &&
  //   !mayBePassingToDelivery
  // ) {
  //   sideEffects.push({ type: 'ObserveUnknownDeliveryCup' });
  // }
  return sideEffects;
}
