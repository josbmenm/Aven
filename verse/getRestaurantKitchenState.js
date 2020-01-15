export default function getRestaurantKitchenState(
  restaurantState,
  kitchenConfig,
) {
  function pumpIngredientEnabled(slotIndex) {
    const slot =
      kitchenConfig && kitchenConfig.subsystems.Beverage.slots[slotIndex];
    const slotId = slot && slot.id;
    if (!slotId || !restaurantState.slotSettings) return true;
    if (!restaurantState.slotSettings[slotId]) return true;
    return restaurantState.slotSettings[slotId].disabledMode !== true;
  }
  const writeKitchenValues = {
    System_SystemLighting_VALUE: !restaurantState.isTraveling,
    FrozenFood_Slot0EnableHopper_VALUE: !restaurantState.disableFrozenHoppers,
    FrozenFood_Slot1EnableHopper_VALUE: !restaurantState.disableFrozenHoppers,
    FrozenFood_Slot2EnableHopper_VALUE: !restaurantState.disableFrozenHoppers,
    FrozenFood_Slot3EnableHopper_VALUE: !restaurantState.disableFrozenHoppers,
    FrozenFood_Slot4EnableHopper_VALUE: !restaurantState.disableFrozenHoppers,
    FrozenFood_Slot5EnableHopper_VALUE: !restaurantState.disableFrozenHoppers,
    FrozenFood_Slot6EnableHopper_VALUE: !restaurantState.disableFrozenHoppers,
    FrozenFood_Slot7EnableHopper_VALUE: !restaurantState.disableFrozenHoppers,
    FrozenFood_Slot8EnableHopper_VALUE: !restaurantState.disableFrozenHoppers,
    Beverage_Slot0EnablePump_VALUE:
      !restaurantState.disableBeveragePumps && pumpIngredientEnabled(0),
    Beverage_Slot1EnablePump_VALUE:
      !restaurantState.disableBeveragePumps && pumpIngredientEnabled(1),
    Beverage_Slot2EnablePump_VALUE:
      !restaurantState.disableBeveragePumps && pumpIngredientEnabled(2),
    Beverage_Slot3EnablePump_VALUE:
      !restaurantState.disableBeveragePumps && pumpIngredientEnabled(3),
  };
  console.log('hello', writeKitchenValues);
  return writeKitchenValues;
}
