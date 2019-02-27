import CloudContext from '../aven-cloud/CloudContext';
import useCloud from '../aven-cloud/useCloud';
import mapObject from 'fbjs/lib/mapObject';
import React, { createContext, useContext, useState, useMemo } from 'react';
import useCloudValue from '../aven-cloud/useCloudValue';
import useObservable from '../aven-cloud/useObservable';
import withObservables from '@nozbe/with-observables';
import observeNull from '../aven-cloud/observeNull';
import { formatCurrency } from '../components/Utils';
const OrderContext = createContext(null);

function doCancelOrderIfNotConfirmed(lastOrder) {
  if (lastOrder.isConfirmed) {
    return lastOrder;
  }
  if (lastOrder.isCancelled) {
    return lastOrder;
  }
  return { ...lastOrder, isCancelled: true, cancelledTime: Date.now() };
}

function doConfirmOrder(lastOrder) {
  if (lastOrder.isConfirmed) {
    return lastOrder;
  }
  return { ...lastOrder, isConfirmed: true, confirmedTime: Date.now() };
}

export function OrderContextProvider({ children }) {
  let cloud = useContext(CloudContext);
  let [currentOrder, setCurrentOrder] = useState(null);
  let [asyncError, setAsyncError] = useState(null);

  if (asyncError) {
    setAsyncError(null);
    throw asyncError;
    // alert(asyncError);
  }

  function guardAsync(promise) {
    promise
      .then(() => {})
      .catch(e => {
        setAsyncError(e);
      });
  }
  let orderContext = {
    order: currentOrder,
    setOrderName: name => {
      guardAsync(
        currentOrder.transact(lastOrder => ({
          ...lastOrder,
          orderName: name,
        })),
      );
    },
    resetOrder: () => {
      if (!currentOrder) {
        return;
      }
      guardAsync(currentOrder.transact(doCancelOrderIfNotConfirmed));
      setCurrentOrder(null);
    },
    cancelOrder: () => {
      currentOrder &&
        guardAsync(
          currentOrder.transact(lastOrder => {
            if (lastOrder.isCancelled) {
              return lastOrder;
            }
            return {
              ...lastOrder,
              isCancelled: true,
              cancelledTime: Date.now(),
            };
          }),
        );
    },
    confirmOrder: () => {
      guardAsync(currentOrder.transact(doConfirmOrder));
    },
    startOrder: () => {
      const order = cloud.get('Orders').post();
      setCurrentOrder(order);
      guardAsync(
        order.put({
          startTime: Date.now(),
          items: [],
        }),
      );
    },
  };
  return (
    <OrderContext.Provider value={orderContext}>
      {children}
    </OrderContext.Provider>
  );
}

export function useCompanyConfig() {
  const cloud = useCloud();
  const theValue = cloud.get('Airtable').expand((folder, doc) => {
    if (!folder) {
      return null;
    }
    return doc.getBlock(folder.files['db.json']);
  });
  return useCloudValue(theValue);
}

export function displayNameOfMenuItem(menuItem) {
  if (!menuItem) {
    return 'Unknown';
  }
  return menuItem['Display Name'] || menuItem['Name'];
}

export function displayNameOfOrderItem(orderItem, menuItem) {
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

export function sellPriceOfMenuItem(menuItem) {
  const sellPrice = menuItem.Recipe
    ? menuItem.Recipe['Sell Price']
    : menuItem['Sell Price'];
  return sellPrice;
}

const TAX_RATE = 0.09;

function getOrderItemMapper(menu) {
  return item => {
    const menuItem =
      item.type === 'blend'
        ? menu.blends.find(i => i.id === item.menuItemId)
        : menu.food.find(i => i.id === item.menuItemId);
    const sellPrice = sellPriceOfMenuItem(menuItem);
    const itemPrice = sellPrice * item.quantity;
    return {
      ...item,
      state: item,
      itemPrice,
      sellPrice,
      menuItem,
    };
  };
}

function getOrderSummary(orderState, companyConfig) {
  const menu = companyConfigToMenu(companyConfig);
  if (!orderState) {
    return null;
  }
  if (!menu) {
    return null;
  }
  const items = orderState.items.map(getOrderItemMapper(menu));
  const subTotal = items.reduce((acc, item) => acc + item.itemPrice, 0);
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

function getAllOrders() {
  let cloud = useCloud();
  return cloud.get('Orders/_children').expand((o, r) => {
    return (
      o &&
      o
        .filter(n => n[0] !== '_')
        .map(orderId => ({
          id: orderId,
          orderState: cloud.get(`Orders/${orderId}`),
        }))
    );
  }).observeValue;
}

export function useOrders() {
  const companyConfig = useCompanyConfig();

  let ordersSource = useMemo(getAllOrders, []);

  let orders = useObservable(ordersSource);

  if (!orders) {
    return [];
  }
  return orders.map(order => {
    return {
      ...order,
      summary: getOrderSummary(order.orderState, companyConfig),
    };
  });
}

export function useOrder() {
  let orderContext = useContext(OrderContext);
  return orderContext;
}

export function getItemCustomizationSummary(item) {
  if (item.type !== 'blend') {
    return [];
  }
  if (!item.customization) {
    return [];
  }
  function getIngredientName(ing) {
    return ing.Name.toLowerCase();
  }
  let summaryItems = [];
  if (item.customization.benefit === null) {
    summaryItems.push('with no benefit');
  }
  if (item.customization.benefit) {
    const benefit =
      item.menuItem.BenefitCustomization[item.customization.benefit];
    summaryItems.push('with ' + benefit.Name.toLowerCase());
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
        summaryItems.push('with ' + getIngredientName(ing));
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

export function addMenuItemToCartItem({
  menuItem,
  orderItemId,
  item,
  itemType,
}) {
  return item
    ? {
        ...item,
        quantity: item.quantity + 1,
      }
    : {
        id: orderItemId,
        type: itemType,
        menuItemId: menuItem.id,
        customization: null,
        quantity: 1,
      };
}

export function useCurrentOrder() {
  let { order } = useContext(OrderContext);
  const observedOrder = useObservable(order ? order.observeValue : observeNull);
  if (!observedOrder) {
    return observedOrder;
  }

  return { ...observedOrder, orderId: order && order.getName() };
}

export function useOrderItem(orderItemId) {
  let { order } = useOrder();

  const menu = useMenu();

  return useMemo(() => {
    async function setItemState(item) {
      console.log('setItemState', item, orderItemId);
      await order.transact(lastOrder => {
        const items = [...lastOrder.items];
        const itemIndex = items.findIndex(i => i.id === item.id);
        if (itemIndex === -1) {
          items.push(item);
        } else {
          items[itemIndex] = item;
        }
        return {
          ...lastOrder,
          items,
        };
      });
      console.log('DONE setItemState', item, orderItemId);
    }
    async function removeItem() {
      await order.transact(lastOrder => {
        const items = lastOrder.items.filter(i => i.id !== orderItemId);
        return {
          ...lastOrder,
          items,
        };
      });
    }
    const itemMapper = menu && getOrderItemMapper(menu);
    const orderItem =
      itemMapper &&
      order &&
      order.map(orderState => {
        const item =
          orderState.items && orderState.items.find(i => i.id === orderItemId);
        return item && itemMapper(item);
      });

    return {
      orderItemId,
      orderItem,
      setItemState,
      removeItem,
      order,
    };
  }, [orderItemId, order, menu]);
}

export function withKitchen(Component) {
  const ComponentWithObservedState = withObservables(
    ['kitchenConfig', 'kitchenState'],
    ({ kitchenConfig, kitchenState }) => ({ kitchenConfig, kitchenState }),
  )(Component);

  return props => (
    <CloudContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          kitchenConfig={restaurant.get('KitchenConfig').observeValue}
          kitchenState={restaurant.get('KitchenState').observeValue}
          kitchenCommand={async (subsystemName, pulse, values) => {
            await restaurant.dispatch({
              type: 'KitchenCommand',
              subsystem: subsystemName,
              pulse,
              values,
            });
          }}
          restaurant={restaurant}
          {...props}
        />
      )}
    </CloudContext.Consumer>
  );
}

const sortByField = (obj, fieldName) => {
  var sortable = [];
  for (var row in obj) {
    sortable.push([row, obj[row]]);
  }
  sortable.sort((a, b) => a[1][fieldName] - b[1][fieldName]);
  return sortable.map(kVal => kVal[1]);
};

export function getActiveBenefit(cartItem, menuItem) {
  if (cartItem && cartItem.customization && cartItem.customization.benefit) {
    return menuItem.BenefitCustomization[cartItem.customization.benefit];
  }
  return menuItem.DefaultBenefit;
}

function companyConfigToBlendMenu(atData) {
  if (!atData) {
    return null;
  }
  const Recipes = atData.baseTables['Recipes'];
  const MenuItemsUnordered = atData.baseTables['KioskBlendMenu'];
  const RecipeIngredients = atData.baseTables['Recipe Ingredients'];
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
  //   Ingredient.CustomizationCategory &&
  //     Ingredient.CustomizationCategory.forEach(categoryName => {
  //       const c =
  //         Customization[categoryName] || (Customization[categoryName] = []);
  //       c.push(Ingredient);
  //     });
  // });

  const MenuItems = sortByField(MenuItemsUnordered, '_index');
  const ActiveMenuItems = MenuItems.filter(i => i['Active in Kiosk']);
  const ActiveItemsWithRecipe = ActiveMenuItems.map(item => {
    const recipeId = item.Recipe[0];
    const Recipe = Recipes && item.Recipe && Recipes[recipeId];
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
    return {
      ...item,
      IngredientCustomization: IngredientCustomization.map(ic => {
        if (!ic.Recipes || ic.Recipes.indexOf(recipeId) === -1) {
          return null;
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
      BenefitCustomization: Benefits,
      DefaultBenefit,
      DefaultBenefitName: DefaultBenefit && DefaultBenefit.Name,
      DisplayPrice: formatCurrency(Recipe['Sell Price']),
      Recipe: {
        ...Recipe,
        Ingredients: thisRecipeIngredients,
      },
    };
  });
  return ActiveItemsWithRecipe;
}

function companyConfigToFoodMenu(atData) {
  if (!atData) {
    return null;
  }
  const MenuItemsUnordered = atData.baseTables['KioskFoodMenu'];
  const MenuItems = sortByField(MenuItemsUnordered, '_index');
  const ActiveMenuItems = MenuItems.filter(i => i['Active in Kiosk']);
  return ActiveMenuItems;
}

function companyConfigToBlendMenuItemMapper(menuItemId) {
  return atData => {
    const menu = companyConfigToBlendMenu(atData);
    return menu.find(item => item.id === menuItemId);
  };
}

function companyConfigToFoodMenuItemMapper(foodItemId) {
  return atData => {
    const menu = companyConfigToFoodMenu(atData);
    return menu.find(item => item.id === foodItemId);
  };
}

export function useMenuItem(menuItemId) {
  const config = useCompanyConfig();
  return useMemo(() => {
    if (!config) return null;
    return companyConfigToBlendMenuItemMapper(menuItemId)(config);
  }, [config, menuItemId]);
}

export function useFoodItem(foodItemId) {
  const config = useCompanyConfig();
  return useMemo(() => {
    if (!config) return null;
    return companyConfigToFoodMenuItemMapper(foodItemId)(config);
  }, [config, foodItemId]);
}

function companyConfigToMenu(companyConfig) {
  const food = companyConfigToFoodMenu(companyConfig);
  const blends = companyConfigToBlendMenu(companyConfig);
  if (food && blends) {
    return { food, blends };
  }
  return null;
}

function getAirtableData() {
  const cloud = useCloud();
  if (!cloud) {
    return observeNull;
  }
  return cloud
    .get('Airtable')
    .observeConnectedValue(['files', 'db.json', 'id']);
}

export function useMenu() {
  const companyConfig = useCompanyConfig();
  const fullMenu = useMemo(() => {
    return companyConfigToMenu(companyConfig);
  }, [companyConfig]);
  return fullMenu;
}

export function useOrderSummary() {
  const currentOrder = useCurrentOrder();
  const companyConfig = useCompanyConfig();
  const summary = getOrderSummary(currentOrder, companyConfig);
  return summary;
}

export function useOrderIdSummary(orderId) {
  const cloud = useCloud();
  const order = useMemo(() => cloud.get(`Orders/${orderId}`), [orderId]);
  const orderState = useObservable(order ? order.observeValue : observeNull);
  const companyConfig = useCompanyConfig();
  return getOrderSummary(orderState, companyConfig);
}

export function withRestaurant(Component) {
  const ComponentWithObservedState = withObservables(
    ['restaurant'],
    ({ restaurant }) => {
      return { restaurant };
    },
  )(Component);

  return props => (
    <CloudContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          restaurantClient={restaurant}
          cloud={restaurant}
          restaurant={restaurant.get('Restaurant').observeValue}
          setAppUpsellPhoneNumber={number => {
            restaurant
              .dispatch({
                type: 'PutAuthMethod',
                verificationInfo: { number, context: 'AppUpsell' },
              })
              .catch(console.error);
          }}
          dispatch={restaurant.dispatch}
          {...props}
        />
      )}
    </CloudContext.Consumer>
  );
}

export const getSubsystem = (subsystemName, kitchenConfig, kitchenState) => {
  if (!kitchenConfig || !kitchenState) {
    return null;
  }
  const ss = kitchenConfig.subsystems[subsystemName];
  if (!ss) {
    return null;
  }
  const reads = mapObject(ss.readTags, (tag, tagName) => {
    const internalTagName = `${subsystemName}_${tagName}_READ`;
    const value = kitchenState[internalTagName];
    const read = { ...tag, value, name: tagName };
    return read;
  });
  const valueCommands = mapObject(ss.valueCommands, (command, tagName) => {
    const internalTagName = `${subsystemName}_${tagName}_VALUE`;
    const value = kitchenState[internalTagName];
    const outCmd = { ...command, value, name: tagName };
    return outCmd;
  });
  const noFaults = reads.NoFaults ? reads.NoFaults.value : null;
  return {
    icon: ss.icon,
    valueCommands,
    pulseCommands: ss.pulseCommands,
    name: subsystemName,
    noFaults,
    reads,
    faults: ss.faults,
  };
};

export const getSubsystemOverview = (kitchenConfig, kitchenState) => {
  if (!kitchenConfig || !kitchenState) {
    return [];
  }
  return Object.keys(kitchenConfig.subsystems).map(subsystemName => {
    return getSubsystem(subsystemName, kitchenConfig, kitchenState);
  });
};
