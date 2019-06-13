import defineCloudFunction from '../cloud-core/defineCloudFunction';

const MenuWithInventory = defineCloudFunction(
  'MenuWithInventory',
  (docState, doc, cloud, getValue) => {
    const menuDoc = cloud.get('OnoState^Menu');
    const menu = getValue(menuDoc);

    const kitchenState = getValue(cloud.get('KitchenState'));
    // const companyConfig = getValue(cloud.get('OnoState^CompanyConfig'));
    const restaurantConfig = getValue(cloud.get('OnoState^RestaurantConfig'));

    if (!menu) {
      return null;
    }

    return { menu, kitchenState, restaurantConfig };
  },
  'a',
);

export default MenuWithInventory;
