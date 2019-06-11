import defineCloudFunction from '../cloud-core/defineCloudFunction';

const InventoryFn = defineCloudFunction(
  'Inventory',
  (nothingDocState, nothingDoc, cloud, getValue) => {
    const restaurantState = getValue(
      cloud.get('RestaurantActionsUnburnt^RestaurantReducer'),
    );
    const kitchenState = getValue(cloud.get('KitchenState'));
    const companyConfig = getValue(cloud.get('OnoState^CompanyConfig'));
    console.log('companyConfig', companyConfig);

    if (!restaurantState) {
      return null;
    }

    const cups = {
      estimatedRemaining: restaurantState.cupInventory.estimatedRemaining,
    };
    const ingredients = {
      ...companyConfig,
    };
    // ingredients[]
    return {
      cups,
      restaurantState,
      ingredients,
    };

    // "cupInventory": {
    //   "estimatedRemaining": 150
    // },
    // "ingredientInventory": {
    //   "rec3nWn1C1ZG7nfdx": {
    //     "estimatedRemaining": 25
    //   },
    //   "rec4WRYNLAja8nfQq": {
    //     "estimatedRemaining": 100
    //   },
    //   "recGBZ2dd7yCv5u8A": {
    //     "estimatedRemaining": 100
    //   },
    //   "recFOEQqPC2bJeayb": {
    //     "estimatedRemaining": 100
    //   }
    // },
    // return { restaurantState, kitchenState };
  },
);

export default InventoryFn;
