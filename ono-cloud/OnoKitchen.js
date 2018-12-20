import CloudContext from '../aven-cloud/CloudContext';
import useCloud from '../aven-cloud/useCloud';
import mapObject from 'fbjs/lib/mapObject';
import React, { createContext, useContext, useState, useMemo } from 'react';
import useObservable from '../aven-cloud/useObservable';
import withObservables from '@nozbe/with-observables';
import observeNull from '../aven-cloud/observeNull';

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
  let orderContext = {
    order: currentOrder,
    setOrderName: async name => {
      await currentOrder.transact(lastOrder => ({
        ...lastOrder,
        orderName: name,
      }));
    },
    resetOrder: async () => {
      if (!currentOrder) {
        return;
      }
      await currentOrder.transact(doCancelOrderIfNotConfirmed);
      setCurrentOrder(null);
    },
    confirmOrder: async () => {
      await currentOrder.transact(doConfirmOrder);
    },
    startOrder: async () => {
      const order = cloud.get('Orders').post();
      setCurrentOrder(order);
      await order.put({
        startTime: Date.now(),
        items: [],
        customization: {},
      });
    },
  };
  return (
    <OrderContext.Provider value={orderContext}>
      {children}
    </OrderContext.Provider>
  );
}

export function useCompanyConfig() {
  return useObservable(useMemo(getAirtableData, []));
}

const TAX_RATE = 0.09;

function getOrderSummary(orderState, companyConfig) {
  const menu = companyConfigToMenu(companyConfig);
  if (!orderState) {
    return orderState;
  }
  let subTotal = 0;
  const items = orderState.items.map(item => {
    const menuItem =
      item.type === 'blend'
        ? menu.blends.find(i => i.id === item.menuItemId)
        : menu.food.find(i => i.id === item.menuItemId);
    if (!menuItem) {
      throw new Error(
        `Cannot compute order summary item because menuItemId "${
          item.menuItemId
        }" of order "${orderState}" was not found`,
      );
    }
    const sellPrice = menuItem.Recipe
      ? menuItem.Recipe['Sell Price']
      : menuItem['Sell Price'];
    subTotal += sellPrice;
    return {
      ...item,
      sellPrice,
      menuItem,
    };
  });
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
  return cloud.get('Orders/_refs').expand((o, r) => {
    return (
      o &&
      o.map(orderId => ({
        id: orderId,
        orderState: cloud.get(`Orders/${orderId}`),
      }))
    );
  }).observeValue;
}

function getOrderCancelHandler(cloud, orderId) {
  async function cancelOrder() {
    await cloud.get(`Orders/${orderId}`).transact(lastOrder => {
      if (lastOrder.isCancelled) {
        return lastOrder;
      }
      return { ...lastOrder, isCancelled: true, cancelledTime: Date.now() };
    });
  }
  return cancelOrder;
}

export function useOrders() {
  let cloud = useCloud();

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
      cancel: getOrderCancelHandler(cloud, order.id),
    };
  });
}

export function useOrder() {
  let orderContext = useContext(OrderContext);
  return orderContext;
}

export function useCurrentOrder() {
  let { order } = useContext(OrderContext);
  const observedOrder = useObservable(order ? order.observeValue : observeNull);
  if (!observedOrder) {
    return observedOrder;
  }

  return { ...observedOrder, orderId: order.getName() };
}

export function useOrderItem(orderItemId) {
  let { order } = useOrder();

  async function setItem(item) {
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
  }
  return {
    orderItemId,
    orderItem:
      order &&
      order.map(orderState => {
        const item = orderState.items && orderState.items[orderItemId];
        return item || {};
      }),
    setItem,
    order,
  };
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
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const sortByField = (obj, fieldName) => {
  var sortable = [];
  for (var row in obj) {
    sortable.push([row, obj[row]]);
  }
  sortable.sort((a, b) => a[1][fieldName] - b[1][fieldName]);
  return sortable.map(kVal => kVal[1]);
};

function companyConfigToBlendMenu(atData) {
  if (!atData) {
    return [];
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
    return {
      ...item,
      IngredientCustomization: IngredientCustomization.map(ic => {
        if (ic.Recipes.indexOf(recipeId) === -1) {
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
      FunctionCustomization: atData.baseTables['Functions'],
      DisplayPrice: currency.format(Recipe['Sell Price']),
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
    return [];
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

function companyConfigToMenu(companyConfig) {
  return {
    food: companyConfigToFoodMenu(companyConfig),
    blends: companyConfigToBlendMenu(companyConfig),
  };
}

export function withMenuItem(Component) {
  const ComponentWithObservedState = withObservables(
    ['atData', 'menuItemId'],
    ({ atData, menuItemId }) => ({
      menuItem: atData.map(companyConfigToBlendMenuItemMapper(menuItemId)),
    }),
  )(Component);

  return props => (
    <CloudContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          atData={restaurant
            .get('Airtable')
            .observeConnectedValue(['files', 'db.json', 'id'])}
          {...props}
        />
      )}
    </CloudContext.Consumer>
  );
}

export function withMenu(Component) {
  const ComponentWithObservedState = withObservables(
    ['atData'],
    ({ atData }) => ({
      blendMenu: atData.map(companyConfigToBlendMenu),
      foodMenu: atData.map(companyConfigToFoodMenu),
    }),
  )(Component);

  return props => (
    <CloudContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          atData={restaurant
            .get('Airtable')
            .observeConnectedValue(['files', 'db.json', 'id'])}
          {...props}
        />
      )}
    </CloudContext.Consumer>
  );
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
  return companyConfigToMenu(companyConfig);
}

export function useOrderSummary() {
  const currentOrder = useCurrentOrder();
  const companyConfig = useCompanyConfig();
  const cloud = useCloud();
  const summary = getOrderSummary(currentOrder, companyConfig);
  if (!summary) {
    return summary;
  }
  return {
    ...summary,
    cancel: getOrderCancelHandler(cloud, summary.orderId),
  };
}

export function useOrderIdSummary(orderId) {
  const cloud = useCloud();
  const order = useMemo(() => cloud.get(`Orders/${orderId}`), [orderId]);
  const orderState = useObservable(order ? order.observeValue : observeNull);
  const companyConfig = useCompanyConfig();
  return getOrderSummary(orderState, companyConfig);
}

export function withDispatch(Component) {
  return props => (
    <CloudContext.Consumer>
      {restaurant => <Component dispatch={restaurant.dispatch} {...props} />}
    </CloudContext.Consumer>
  );
}

export function withKitchenLog(Component) {
  const ComponentWithObservedState = withObservables(
    ['kitchenLog'],
    ({ kitchenLog }) => {
      return { kitchenLog };
    },
  )(Component);

  return props => (
    <CloudContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          kitchenLog={restaurant.get('KitchenLog').observeValue}
          {...props}
        />
      )}
    </CloudContext.Consumer>
  );
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

export function withOrder(Component) {
  const ComponentWithObservedState = withObservables(['order'], ({ order }) => {
    return { order };
  })(Component);

  return props => (
    <CloudContext.Consumer>
      {cloud => (
        <ComponentWithObservedState
          order={cloud.get('Orders/' + props.orderId).observeValue}
          setOrderName={name => {
            cloud
              .get('Orders/' + props.orderId)
              .transact(lastState => ({
                ...lastState,
                name,
              }))
              .catch(console.error);
          }}
          setOrderItem={(itemId, item) => {
            cloud
              .get('Orders/' + props.orderId)
              .transact(lastState => ({
                ...lastState,
                items: {
                  ...((lastState && lastState.items) || {}),
                  [itemId]: item,
                },
              }))
              .catch(console.error);
          }}
          placeOrder={order => {
            cloud
              .get('Restaurant')
              .transact(lastState => ({
                ...lastState,
                queuedOrders: [
                  ...((lastState && lastState.queuedOrders) || []),
                  {
                    ...order,
                    orderTime: Date.now(),
                  },
                ],
              }))
              .catch(console.error);
          }}
          dispatch={cloud.dispatch}
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
