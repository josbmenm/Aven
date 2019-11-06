export default function getRestaurantKitchenState(restaurantState) {
  return {
    System_LightingEnabled_VALUE: !restaurantState.isTraveling,
  };
}
