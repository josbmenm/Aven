export default function getRestaurantKitchenState(restaurantState) {
  return {
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
    Beverage_Slot0EnablePump_VALUE: !restaurantState.disableBeveragePumps,
    Beverage_Slot1EnablePump_VALUE: !restaurantState.disableBeveragePumps,
    Beverage_Slot2EnablePump_VALUE: !restaurantState.disableBeveragePumps,
    Beverage_Slot3EnablePump_VALUE: !restaurantState.disableBeveragePumps,
  };
}
