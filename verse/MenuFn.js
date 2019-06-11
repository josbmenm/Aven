import defineCloudFunction from '../cloud-core/defineCloudFunction';

const MenuFn = defineCloudFunction(
  'Menu',
  (nothingDocState, nothingDoc, cloud, getValue) => {
    const restaurantState = getValue(
      cloud.get('RestaurantActionsUnburnt^RestaurantReducer'),
    );
    const kitchenState = getValue(cloud.get('KitchenState'));
    return { restaurantState, kitchenState };
  },
);

export default MenuFn;
