import formatCurrency from '../utils/formatCurrency';

export const TAX_RATE = 0.09;

function mapObject(inObj, mapper) {
  const out = {};
  Object.keys(inObj).forEach(k => {
    out[k] = mapper(inObj[k]);
  });
  return out;
}

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
  if (customization) {
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
  const Recipes = atData.baseTables.Recipes;
  const MenuItemsUnordered = atData.baseTables.KioskBlendMenu;
  const RecipeIngredients = atData.baseTables.RecipeIngredients;
  const Dietary = atData.baseTables.Dietary;
  const Ingredients = atData.baseTables.Ingredients;

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
    const DefaultBenefitEnhancementIngredient =
      DefaultBenefitEnhancement &&
      DefaultBenefitEnhancement['Enhancement Ingredient'] &&
      Ingredients[DefaultBenefitEnhancement['Enhancement Ingredient'][0]];
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
        let defaultValue = [];
        thisRecipeIngredients.forEach(ri => {
          const ing = ri.Ingredient;
          if (
            ing &&
            ing.id &&
            ri.DispenseCount &&
            ic.Ingredients.indexOf(ing.id) !== -1
          ) {
            defaultValue = [
              ...defaultValue,
              ...Array(ri.DispenseCount).fill(ing.id),
            ];
          }
        });
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
      AllBenefits: mapObject(atData.baseTables.Benefits, b => ({
        ...b,
        EnhancementIngredient: Ingredients[b['Enhancement Ingredient']],
      })),
      BenefitCustomization: Benefits,
      Dietary,
      Benefits: ItemBenefits,
      DefaultEnhancementId: defaultEnhancementId,
      DefaultBenefitEnhancement,
      DefaultBenefitEnhancementIngredient,
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
  let promo = orderState.promo;
  const items = orderState.items.map(getOrderItemMapper(menu));
  const subTotalBeforeDiscount = items.reduce((acc, item) => {
    return acc + item.itemPrice;
  }, 0);
  const taxBeforeDiscount = subTotalBeforeDiscount * TAX_RATE;
  const totalBeforeDiscount = subTotalBeforeDiscount + taxBeforeDiscount;

  let discountTotal = 0;
  if (promo && promo.type === 'FreeBlends') {
    const blendTotals = items
      .map(item => Array(item.quantity).fill(item.sellPrice))
      .flat();
    const freeBlendTotals = blendTotals.sort().slice(-promo.count);
    const freeBlendsDiscount = freeBlendTotals.reduce((acc, t) => acc + t, 0);
    discountTotal += freeBlendsDiscount;
    console.log({
      promo,
      blendTotals,
      freeBlendsDiscount,
      freeBlendTotals,
      discountTotal,
    });
  }
  const subTotal = subTotalBeforeDiscount - discountTotal;
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
    discountTotal,
    totalBeforeDiscount,
    taxRate: TAX_RATE,
    promo,
  };
}

export function getSelectedIngredients(menuItem, cartItem, companyConfig) {
  if (!menuItem || !menuItem.Recipe) {
    return [];
  }
  const allIngredients =
    companyConfig &&
    companyConfig.baseTables &&
    companyConfig.baseTables.Ingredients;
  const customizationCategories =
    companyConfig &&
    companyConfig.baseTables &&
    companyConfig.baseTables.IngredientCustomization;
  const customIngredients =
    cartItem && cartItem.customization && cartItem.customization.ingredients;
  const customEnhancements =
    cartItem && cartItem.customization && cartItem.customization.enhancements;
  let origRecipeVolume = menuItem.Recipe.Ingredients.reduce((acc, rI) => {
    return acc + rI.DispenseCount * rI.Ingredient['ShotSize(ml)'];
  }, 0);
  const invalidReasons = [];
  let enhancementIngredients = [
    {
      ...menuItem.DefaultBenefitEnhancementIngredient,
      amountVolumeRatio:
        menuItem.DefaultBenefitEnhancementIngredient['ShotSize(ml)'],
      amount: 1,
    },
  ];
  let standardIngredients = menuItem.Recipe.Ingredients.map(
    recipeIngredient => {
      return {
        ...recipeIngredient.Ingredient,
        amount: recipeIngredient.DispenseCount,
        amountVolumeRatio: recipeIngredient.Ingredient['ShotSize(ml)'],
      };
    },
  );
  if (customEnhancements) {
    enhancementIngredients = customEnhancements.map(enhId => {
      return {
        ...menuItem.AllBenefits[enhId].EnhancementIngredient,
        amountVolumeRatio:
          menuItem.AllBenefits[enhId].EnhancementIngredient['ShotSize(ml)'],
        amount: 1,
      };
    });
  }
  if (customIngredients) {
    Object.keys(customIngredients).forEach(customCategoryName => {
      const categoryIngredientIds = customIngredients[customCategoryName];
      const category = Object.keys(customizationCategories)
        .map(id => customizationCategories[id])
        .find(c => c.Name === customCategoryName);
      const dispensesInOrigRecipe = menuItem.Recipe.Ingredients.reduce(
        (dispenseCount, recipeIngredient) => {
          const ingredient = recipeIngredient.Ingredient;
          if (category.Ingredients.indexOf(ingredient.id) !== -1) {
            return dispenseCount + recipeIngredient.DispenseCount;
          }
          return dispenseCount;
        },
        0,
      );
      const minDispenses = Math.max(
        0,
        dispensesInOrigRecipe - (category['Underflow Limit'] || 0),
      );
      console.log('minDispenses', customCategoryName, minDispenses);
      const ingredientIdCounts = {};
      categoryIngredientIds.forEach(ingId => {
        if (ingredientIdCounts[ingId] == null) {
          ingredientIdCounts[ingId] = 0;
        }
        ingredientIdCounts[ingId] += 1;
      });
      standardIngredients = [
        ...standardIngredients.filter(
          i => category.Ingredients.indexOf(i.id) === -1,
        ),
        ...Object.keys(ingredientIdCounts).map(ingId => {
          const ingredient = allIngredients[ingId];
          return {
            ...allIngredients[ingId],
            amount: ingredientIdCounts[ingId],
            amountVolumeRatio: ingredient['ShotSize(ml)'],
          };
        }),
      ];
    });
  }

  function getVol(ings) {
    return ings.reduce((vol, ing) => {
      return vol + ing.amount * ing.amountVolumeRatio;
    }, 0);
  }
  const enhancementsVolume = getVol(enhancementIngredients);
  const ingredientsVolume = getVol(standardIngredients);
  const finalVolume = ingredientsVolume + enhancementsVolume;
  const outputIngredients = [...enhancementIngredients, ...standardIngredients];
  return {
    enhancementIngredients,
    standardIngredients,
    ingredients: outputIngredients,
    origRecipeVolume,
    finalVolume,
    enhancementsVolume,
    ingredientsVolume,
  };
}