import formatCurrency from '../utils/formatCurrency';

export const TAX_RATE = 0.09;

export function displayNameOfMenuItem(menuItem) {
  if (!menuItem) {
    return 'Unknown';
  }
  return menuItem['Display Name'] || menuItem['Name'];
}
export function displayNameOfOrderItem(orderItem, menuItem) {
  if (!menuItem) {
    return 'unknown product';
  }
  if (!orderItem) {
    return displayNameOfMenuItem(menuItem);
  }
  const { customization } = orderItem;
  const name = menuItem['Display Name'] || menuItem['Name'];
  if (customization && customization.ingredients) {
    return `custom ${name}`;
  }
  return name;
}
export function sortByField(obj, fieldName) {
  var sortable = [];
  for (var row in obj) {
    sortable.push([row, obj[row]]);
  }
  sortable.sort((a, b) => a[1][fieldName] - b[1][fieldName]);
  return sortable.map(kVal => kVal[1]);
}

export function sellPriceOfMenuItem(menuItem) {
  const sellPrice = menuItem.Recipe
    ? menuItem.Recipe['Sell Price']
    : menuItem['Sell Price'];
  return sellPrice;
}

export function getOrderItemMapper(menu) {
  return item => {
    const menuItem =
      item.type === 'blend'
        ? menu.blends.find(i => i.id === item.menuItemId)
        : menu.food.find(i => i.id === item.menuItemId);
    const recipeBasePrice = sellPriceOfMenuItem(menuItem);
    let sellPrice = recipeBasePrice;
    if (
      item.customization &&
      item.customization.enhancements &&
      item.customization.enhancements.length > 1
    ) {
      const extraEnhancementCount = item.customization.enhancements.length - 1;
      sellPrice += extraEnhancementCount * 0.5;
    }
    const itemPrice = sellPrice * item.quantity;
    return {
      ...item,
      state: item,
      itemPrice,
      recipeBasePrice,
      sellPrice,
      menuItem,
    };
  };
}

export function companyConfigToBlendMenu(atData) {
  if (!atData) {
    return null;
  }
  const Recipes = atData.baseTables['Recipes'];
  const MenuItemsUnordered = atData.baseTables['KioskBlendMenu'];
  const RecipeIngredients = atData.baseTables['Recipe Ingredients'];
  const Dietary = atData.baseTables['Dietary'];
  const Ingredients = atData.baseTables['Ingredients'];

  const IngredientCustomization = Object.keys(
    atData.baseTables['IngredientCustomization'],
  ).map(CustomizationId => {
    const customCategory =
      atData.baseTables['IngredientCustomization'][CustomizationId];
    return {
      ...customCategory,
    };
  });

  const MenuItems = sortByField(MenuItemsUnordered, '_index');
  const ActiveMenuItems = MenuItems.filter(i => i['Active in Kiosk']);
  const ActiveItemsWithRecipe = ActiveMenuItems.map(item => {
    const recipeId = item.Recipe[0];
    const Recipe = Recipes && item.Recipe && Recipes[recipeId];
    if (!Recipe || !Recipe.Ingredients) {
      console.warn('Invalid recipe!', Recipe);
      return null;
    }
    const thisRecipeIngredients = Recipe.Ingredients.map(RecipeIngredientId => {
      const ri = RecipeIngredients[RecipeIngredientId];
      if (!ri || !ri.Ingredient) {
        return null;
      }
      return {
        ...ri,
        Ingredient: Ingredients[ri.Ingredient[0]],
      };
    }).filter(v => !!v);
    const thisRecipeIngredientIds = thisRecipeIngredients.map(
      ri => ri.Ingredient.id,
    );
    const defaultEnhancementId =
      Recipe && Recipe.DefaultEnhancement && Recipe.DefaultEnhancement[0];
    const Benefits = atData.baseTables['Benefits'];
    const DefaultBenefitEnhancement = defaultEnhancementId
      ? Benefits[defaultEnhancementId]
      : null;
    if (defaultEnhancementId && !DefaultBenefitEnhancement) {
      debugger;
    }

    const ItemBenefits = Object.keys(Benefits)
      .map(benefitId => {
        const benefit = Benefits[benefitId];
        if (
          DefaultBenefitEnhancement &&
          DefaultBenefitEnhancement.id === benefitId
        ) {
          return benefit;
        }
        const benefitingIngredients = benefit.Ingredients.filter(
          ingId => thisRecipeIngredientIds.indexOf(ingId) !== -1,
        );
        if (benefitingIngredients.length > 0) {
          return benefit;
        }
        return null;
      })
      .filter(Boolean);

    return {
      ...item,
      IngredientCustomization: IngredientCustomization.map(ic => {
        if (!ic.Recipes || ic.Recipes.indexOf(recipeId) === -1) {
          return null;
        }
        if (!ic.Ingredients) {
          throw new Error(
            `No ingredients specified for customization category "${ic.Name}"`,
          );
        }
        const defaultValue = ic.Ingredients.filter(
          IngredientId => thisRecipeIngredientIds.indexOf(IngredientId) !== -1,
        );
        return {
          ...ic,
          Recipes: undefined,
          defaultValue,
          optionLimit: defaultValue.length + ic['Overflow Limit'],
          Ingredients: ic.Ingredients.map(
            IngredientId => Ingredients[IngredientId],
          ),
        };
      }).filter(ic => !!ic),
      tables: atData.baseTables,
      BenefitCustomization: Benefits,
      Dietary,
      Benefits: ItemBenefits,
      DefaultEnhancementId: defaultEnhancementId,
      DefaultBenefitEnhancement,
      DefaultBenefitEnhancementName:
        DefaultBenefitEnhancement && DefaultBenefitEnhancement.Name,
      DisplayPrice: formatCurrency(Recipe['Sell Price']),
      Recipe: {
        ...Recipe,
        Ingredients: thisRecipeIngredients,
      },
    };
  }).filter(Boolean);
  return ActiveItemsWithRecipe;
}

export function companyConfigToFoodMenu(atData) {
  if (!atData) {
    return null;
  }
  const MenuItemsUnordered = atData.baseTables['KioskFoodMenu'];
  const MenuItems = sortByField(MenuItemsUnordered, '_index');
  const ActiveMenuItems = MenuItems.filter(i => i['Active in Kiosk']);
  return ActiveMenuItems;
}

export function companyConfigToMenu(companyConfig) {
  const food = companyConfigToFoodMenu(companyConfig);
  const blends = companyConfigToBlendMenu(companyConfig);
  if (food && blends) {
    return { food, blends };
  }
  return null;
}

export function getOrderSummary(orderState, companyConfig) {
  const menu = companyConfigToMenu(companyConfig);
  if (!orderState) {
    return null;
  }
  if (!menu) {
    return null;
  }
  const items = orderState.items.map(getOrderItemMapper(menu));
  const subTotal = items.reduce((acc, item) => {
    return acc + item.itemPrice;
  }, 0);
  const tax = subTotal * TAX_RATE;
  const total = subTotal + tax;
  const { isConfirmed, isCancelled, orderId } = orderState;
  let state = isConfirmed ? 'confirmed' : 'pending';
  if (isCancelled) {
    state = 'cancelled';
  }
  return {
    isCancelled,
    orderId,
    isConfirmed,
    name: orderState.orderName || 'No Name',
    state,
    order: orderState,
    menu,
    items,
    subTotal,
    tax,
    total,
    taxRate: TAX_RATE,
  };
}
