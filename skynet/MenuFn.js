import defineCloudFunction from '../cloud-core/defineCloudFunction';

import {
  companyConfigToBlendMenu,
  getOrderItemMapper,
  sortByField as getSortedByField,
  TAX_RATE,
  sellPriceOfMenuItem as getSellPriceOfMenuItem,
  displayNameOfMenuItem as getDisplayNameOfMenuItem,
  displayNameOfOrderItem as getDisplayNameOfOrderItem,
  getSelectedIngredients as doGetSelectedIngredients,
  getItemCustomizationSummary as doGetItemCustomizationSummary,
  getSellPriceOfItem as doGetSellPriceOfItem,
  getOrderSummary,
  companyConfigToMenu,
  companyConfigToFoodMenu,
} from '../logic/configLogic';

const Menu = defineCloudFunction(
  'Menu',
  (docState, doc, cloud, getValue) => {
    const companyConfigDoc = cloud.get('OnoState^CompanyConfig');
    const companyConfig = getValue(companyConfigDoc);

    if (!companyConfig) {
      return null;
    }

    return {
      blends: companyConfigToMenu(companyConfig),
      // food: companyConfigToFoodMenu(companyConfig),
    };
  },
  'a',
);

export default Menu;
