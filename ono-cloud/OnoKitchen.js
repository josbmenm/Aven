import CloudContext from '../cloud-core/CloudContext';
import useCloud from '../cloud-core/useCloud';
import mapObject from 'fbjs/lib/mapObject';
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import useCloudValue from '../cloud-core/useCloudValue';
import useObservable from '../cloud-core/useObservable';
import withObservables from '@nozbe/with-observables';
import observeNull from '../cloud-core/observeNull';
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

export function getSubsystemFaults(system) {
  let faults = null;
  if (system.reads.NoFaults && system.reads.NoFaults.value !== true) {
    // system has faulting behavior
    faults = [];
    const faulted = Array(4)
      .fill(0)
      .map((_, faultIntIndex) => {
        return system.reads[`Fault${faultIntIndex}`].value
          .toString(2)
          .split('')
          .reverse()
          .map(v => v === '1');
      });
    if (faulted[0][0]) {
      faults.push(
        'Watchdog timout on step ' + system.reads.WatchDogFrozeAt.value,
      );
    }
    system.faults &&
      system.faults.forEach(f => {
        const isFaulted = faulted[f.intIndex][f.bitIndex];
        if (isFaulted) {
          faults.push(f.description);
        }
      });
  }
  if (faults && !faults.length) {
    faults.push('Unknown Fault');
  }
  return faults;
}

export function OrderContextProvider({ children }) {
  let cloud = useContext(CloudContext);
  const restaurantActions = cloud.get('RestaurantActions');
  let [currentOrder, setCurrentOrder] = useState(null);
  let [asyncError, setAsyncError] = useState(null);

  if (asyncError) {
    setAsyncError(null);
    throw asyncError;
  }

  function guardAsync(promise) {
    return promise
      .then(() => {})
      .catch(e => {
        setAsyncError(e);
      });
  }

  useEffect(() => {
    guardAsync(cloud.establishAnonymousSession());
  }, []);

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
      console.log('RESET ORDER!');
      if (!currentOrder) {
        return;
      }
      console.log('oRderrr', currentOrder.getFullName());
      guardAsync(currentOrder.transact(doCancelOrderIfNotConfirmed));
      setCurrentOrder(null);
    },
    cancelOrder: () => {
      console.log('CANCEL ORDER!');
      console.log('oRderrr', currentOrder && currentOrder.getFullName());
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
      console.log('CONFIRM ORDER!');
      guardAsync(
        (async () => {
          await currentOrder.transact(doConfirmOrder);
          await cloud.dispatch({
            type: 'PlaceOrder',
            orderId: currentOrder.getName(),
          });
        })(),
      );
    },
    startOrder: () =>
      guardAsync(
        (async () => {
          console.log('START ORDER!');
          const order = cloud.get('Orders').post();
          setCurrentOrder(order);
          console.log('POST ORDER!', order.getFullName());

          await order.put({
            startTime: Date.now(),
            items: [],
          });
          console.log('posted order!', order.getFullName());
          order.observeValue.subscribe({
            next: oo => {
              console.log('Lol ok, order changed!', oo);
            },
          });
        })(),
      ),
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

function getOrderSummary(orderState, companyConfig) {
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
    return ing.Name.toLowerCase().trim();
  }
  let summaryItems = [];
  if (item.customization.enhancements === null) {
    summaryItems.push('with no enhancement');
  }
  if (
    item.customization.enhancements &&
    item.customization.enhancements.length
  ) {
    const enhancementId = item.customization.enhancements[0];
    const enhancement = item.menuItem.BenefitCustomization[enhancementId];
    const isDifferentFromDefaultEnhancement =
      item.menuItem.DefaultEnhancementId !== enhancementId;
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

export function addMenuItemToCartItem({
  menuItem,
  orderItemId,
  item,
  itemType,
  customization = null,
}) {
  return item
    ? {
        ...item,
        quantity: item.quantity + 1,
        customization: {
          ...item.customization,
          ...customization,
        },
      }
    : {
        id: orderItemId,
        type: itemType,
        menuItemId: menuItem.id,
        customization,
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

export function sortByField(obj, fieldName) {
  var sortable = [];
  for (var row in obj) {
    sortable.push([row, obj[row]]);
  }
  sortable.sort((a, b) => a[1][fieldName] - b[1][fieldName]);
  return sortable.map(kVal => kVal[1]);
}

export function getActiveEnhancement(cartItem, menuItem) {
  if (
    cartItem &&
    cartItem.customization &&
    cartItem.customization.enhancement === null
  ) {
    return null;
  }
  if (
    cartItem &&
    cartItem.customization &&
    cartItem.customization.enhancement
  ) {
    return menuItem.tables.Benefits[cartItem.customization.enhancement];
  }
  return menuItem.DefaultBenefitEnhancement;
}

function companyConfigToBlendMenu(atData) {
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
