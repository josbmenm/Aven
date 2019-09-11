import formatCurrency from '../utils/formatCurrency';
import { error } from '../logger/logger';

export const TAX_RATE = 0.09;
export const MAX_CUP_VOLUME = 590;

function mapObject(inObj, mapper) {
  const out = {};
  Object.keys(inObj).forEach(k => {
    out[k] = mapper(inObj[k]);
  });
  return out;
}
function applyTax(amount) {
  return Math.floor(amount * TAX_RATE);
}

export function displayNameOfMenuItem(menuItem) {
  if (!menuItem) {
    return 'Unknown';
  }
  return menuItem['Display Name'] || menuItem['Name'];
}

export function getMenuItemSlug(menuItem) {
  return menuItem.Slug;
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
  return sellPrice * 100;
}

export function getFillsOfOrderItem(menuItem, item, companyConfig) {
  if (!menuItem || !companyConfig) {
    return [];
  }
  const { ingredients } = getSelectedIngredients(menuItem, item, companyConfig);
  const KitchenSlots = companyConfig.baseTables.KitchenSlots;
  const KitchenSystems = companyConfig.baseTables.KitchenSystems;
  const requestedFills = ingredients
    .map(ing => {
      const kitchenSlotId = Object.keys(KitchenSlots).find(slotId => {
        const slot = KitchenSlots[slotId];
        return slot.Ingredient && ing.id === slot.Ingredient[0];
      });
      const kitchenSlot = kitchenSlotId && KitchenSlots[kitchenSlotId];
      if (!kitchenSlot) {
        return {
          ingredientId: ing.id,
          ingredientName: ing.Name,
          invalid: 'NoSlot',
          index: 0,
        };
      }
      const kitchenSystemId =
        kitchenSlot.KitchenSystem && kitchenSlot.KitchenSystem[0];
      const kitchenSystem = kitchenSystemId && KitchenSystems[kitchenSystemId];
      if (!kitchenSystem) {
        return {
          ingredientId: ing.id,
          ingredientName: ing.Name,
          slotId: kitchenSlotId,
          invalid: 'NoSystem',
          index: 0,
        };
      }
      return {
        amount: ing.amount,
        amountVolumeRatio: ing.amountVolumeRatio,
        ingredientId: ing.id,
        ingredientName: ing.Name,
        ingredientColor: ing.Color,
        ingredientIcon: ing.Icon,
        ingredientImage: ing.Image,
        slotId: kitchenSlotId,
        systemName: kitchenSystem.Name,
        systemId: kitchenSystemId,
        slot: kitchenSlot.Slot,
        system: kitchenSystem.FillSystemID,
        index: kitchenSlot._index,
        invalid: null,
      };
    })
    .sort((a, b) => a.index - b.index);
  const invalidFills = requestedFills.filter(f => !!f.invalid);
  if (invalidFills.length) {
    console.error('Invalid Fills:', invalidFills);
    throw new Error('Invalid fills!');
  }
  return requestedFills;
}

export function getItemCustomizationSummary(item) {
  if (item.type !== 'blend') {
    return [];
  }
  if (!item.customization) {
    return [];
  }
  function getIngredientName(ing) {
    return ing.Name.toLowerCase().trim();
  }
  let summaryItems = [];
  if (item.customization.enhancements === null) {
    summaryItems.push('with no enhancement');
  }
  if (item.customization.liquidBase) {
    const liquidIng = item.menuItem.LiquidOptions.find(
      li => item.customization.liquidBase === li.id,
    );
    liquidIng && summaryItems.push('with ' + getIngredientName(liquidIng));
  }
  if (
    item.customization.enhancements &&
    item.customization.enhancements.length
  ) {
    const enhancementId = item.customization.enhancements[0];
    const enhancement = item.menuItem.BenefitCustomization[enhancementId];
    const isDifferentFromDefaultEnhancement =
      item.menuItem.DefaultBenefitId !== enhancementId;
    isDifferentFromDefaultEnhancement &&
      summaryItems.push('with ' + enhancement.Name.toLowerCase());
    const extraEnhancement =
      item.menuItem.BenefitCustomization[item.customization.enhancements[1]];
    extraEnhancement &&
      summaryItems.push(`add ${extraEnhancement.Name.toLowerCase()} ($.50)`);
  }
  item.customization.ingredients &&
    Object.keys(item.customization.ingredients).forEach(categoryName => {
      const categorySpec = item.menuItem.IngredientCustomization.find(
        a => a.Name === categoryName,
      );
      const categorySize =
        categorySpec.defaultValue.length + categorySpec['Overflow Limit'];
      const category = item.customization.ingredients[categoryName];
      if (categorySize === 1) {
        const ing = categorySpec.Ingredients.find(i => i.id === category[0]);
        if (ing) {
          summaryItems.push(`with ${getIngredientName(ing)}`);
        } else {
          const defaultIngId = categorySpec.defaultValue[0];
          const defaultIng = categorySpec.Ingredients.find(
            i => i.id === defaultIngId,
          );
          summaryItems.push(`remove ${getIngredientName(defaultIng)}`);
        }
      } else {
        const defaultIngCounts = {};
        const allIngIds = new Set();
        categorySpec.defaultValue.forEach(ingId => {
          defaultIngCounts[ingId] = defaultIngCounts[ingId]
            ? defaultIngCounts[ingId] + 1
            : 1;
          allIngIds.add(ingId);
        });
        const customIngCounts = {};
        category.forEach(ingId => {
          customIngCounts[ingId] = customIngCounts[ingId]
            ? customIngCounts[ingId] + 1
            : 1;
          allIngIds.add(ingId);
        });
        allIngIds.forEach(ingId => {
          const ing = categorySpec.Ingredients.find(i => i.id === ingId);
          if (!ing) {
            return;
          }
          const defaultCount = defaultIngCounts[ingId] || 0;
          const customCount = customIngCounts[ingId] || 0;
          if (customCount === defaultCount + 1) {
            summaryItems.push(`add ${getIngredientName(ing)}`);
          } else if (customCount > defaultCount) {
            summaryItems.push(
              `add ${customCount - defaultCount} ${getIngredientName(ing)}`,
            );
          } else if (customCount === defaultCount - 1) {
            summaryItems.push(`remove ${getIngredientName(ing)}`);
          } else if (customCount < defaultCount) {
            summaryItems.push(
              `remove ${defaultCount - customCount} ${getIngredientName(ing)}`,
            );
          }
        });
      }
    });

  return summaryItems;
}

export const ENHANCEMENT_PRICE = 50;

export function getSellPriceOfItem(item, menuItem) {
  let sellPrice = sellPriceOfMenuItem(menuItem);
  if (
    item &&
    item.customization &&
    item.customization.enhancements &&
    item.customization.enhancements.length > 1
  ) {
    const extraEnhancementCount = item.customization.enhancements.length - 1;
    sellPrice += extraEnhancementCount * ENHANCEMENT_PRICE;
  }
  return sellPrice;
}

export function getOrderItemMapper(menu) {
  return item => {
    const menuItem =
      item.type === 'blend'
        ? menu.blends.find(i => i.id === item.menuItemId)
        : menu.food.find(i => i.id === item.menuItemId);
    const recipeBasePrice = sellPriceOfMenuItem(menuItem);
    const sellPrice = getSellPriceOfItem(item, menuItem);
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
    const defaultBenefitId =
      Recipe && Recipe.DefaultBenefit && Recipe.DefaultBenefit[0];
    const Benefits = atData.baseTables['Benefits'];
    const DefaultBenefit = defaultBenefitId ? Benefits[defaultBenefitId] : null;
    const DefaultBenefitIngredient =
      DefaultBenefit &&
      DefaultBenefit['Benefit Ingredient'] &&
      Ingredients[DefaultBenefit['Benefit Ingredient'][0]];
    const ItemBenefits = Object.keys(Benefits)
      .map(benefitId => {
        const benefit = Benefits[benefitId];
        if (DefaultBenefit && DefaultBenefit.id === benefitId) {
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

    const LiquidOptions = Object.values(Ingredients).filter(
      ing => ing.IsBeverageBase,
    );

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
        BenefitIngredient: Ingredients[b['Benefit Ingredient']],
      })),
      BenefitCustomization: Benefits,
      Dietary,
      LiquidOptions,
      Benefits: ItemBenefits,
      DefaultBenefitId: defaultBenefitId,
      DefaultBenefit,
      DefaultBenefitIngredient,
      DefaultBenefitName: DefaultBenefit && DefaultBenefit.Name,
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
  const taxBeforeDiscount = applyTax(subTotalBeforeDiscount);
  const totalBeforeDiscount = subTotalBeforeDiscount + taxBeforeDiscount;

  let discountTotal = 0;
  if (promo && promo.type === 'FreeBlends') {
    const blendTotals = items
      .map(item => Array(item.quantity).fill(item.sellPrice))
      .flat();
    const freeBlendTotals = blendTotals.sort().slice(-promo.count);
    const freeBlendsDiscount = freeBlendTotals.reduce((acc, t) => acc + t, 0);
    discountTotal += freeBlendsDiscount;
  }
  const subTotal = subTotalBeforeDiscount - discountTotal;
  const tax = applyTax(subTotal);
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
    subTotalDollars: subTotal / 100, // logging convenience
    tax,
    total,
    totalDollars: total / 100, // logging convenience
    discountTotal,
    totalBeforeDiscount,
    taxRate: TAX_RATE,
    promo,
  };
}

export function getSelectedIngredients(menuItem, cartItem, companyConfig) {
  if (!menuItem || !menuItem.Recipe || !companyConfig) {
    return null;
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
  let enhancementIngredients = [
    {
      ...menuItem.DefaultBenefitIngredient,
      amountVolumeRatio: menuItem.DefaultBenefitIngredient['ShotSize(ml)'],
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
        ...menuItem.AllBenefits[enhId].BenefitIngredient,
        amountVolumeRatio:
          menuItem.AllBenefits[enhId].BenefitIngredient['ShotSize(ml)'],
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
  const finalVolumeBeforeLiquid = ingredientsVolume + enhancementsVolume;
  const customBaseLiquidIngId =
    cartItem && cartItem.customization && cartItem.customization.liquidBase;
  const baseLiquidIngId =
    customBaseLiquidIngId || menuItem.Recipe.LiquidBaseIngredient[0];
  const baseLiquidIng = allIngredients[baseLiquidIngId];
  const shouldFillCupWithLiquidBase =
    !!baseLiquidIng && !!menuItem.Recipe.Customizable;
  if (!shouldFillCupWithLiquidBase) {
    if (menuItem.Recipe.Customizable && !!baseLiquidIng) {
      error('BaseLiquidMissing', {
        baseLiquidIngId,
        recipeId: menuItem.Recipe.id,
      });
    }
    return {
      enhancementIngredients,
      standardIngredients,
      ingredients: [...enhancementIngredients, ...standardIngredients],
      origRecipeVolume,
      finalVolume: finalVolumeBeforeLiquid,
      liquidVolume: 0,
      enhancementsVolume,
      ingredientsVolume,
    };
  }
  const baseLiquidShotSize = baseLiquidIng['ShotSize(ml)'];
  const volumeRemaining = MAX_CUP_VOLUME - finalVolumeBeforeLiquid;
  const liquidShotCount = Math.floor(volumeRemaining / baseLiquidShotSize);
  const liquidVolume = baseLiquidShotSize * liquidShotCount;
  const finalVolume = liquidVolume + finalVolumeBeforeLiquid;
  const baseLiquidIngredient = {
    ...baseLiquidIng,
    amount: liquidShotCount,
    amountVolumeRatio: baseLiquidShotSize,
  };
  const outputIngredients = [
    ...enhancementIngredients,
    ...standardIngredients,
    baseLiquidIngredient,
  ];
  return {
    enhancementIngredients,
    standardIngredients,
    baseLiquidIngredient,
    ingredients: outputIngredients,
    origRecipeVolume,
    finalVolume,
    liquidVolume,
    enhancementsVolume,
    ingredientsVolume,
  };
}

export function dietaryInfosOfMenuItem(menuItem, selectedIngredientIds) {
  return (
    menuItem &&
    Object.keys(menuItem.Dietary)
      .map(dId => menuItem.Dietary[dId])
      .filter(diet => {
        if (diet['Applies To All Ingredients']) {
          return true;
        }
        if (!diet.Ingredients) {
          return false;
        }
        if (
          selectedIngredientIds.find(
            ingId => diet.Ingredients.indexOf(ingId) === -1,
          )
        ) {
          return false;
        }
        return true;
      })
  );
}
