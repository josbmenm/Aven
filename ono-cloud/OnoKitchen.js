import OnoRestaurantContext from './OnoRestaurantContext';
import mapObject from 'fbjs/lib/mapObject';
import React from 'react';
import withObservables from '@nozbe/with-observables';

export function withKitchen(Component) {
  const ComponentWithObservedState = withObservables(
    ['kitchenConfig', 'kitchenState'],
    ({ kitchenConfig, kitchenState }) => ({ kitchenConfig, kitchenState }),
  )(Component);

  return props => (
    <OnoRestaurantContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          kitchenConfig={restaurant.getRef('KitchenConfig').observeValue}
          kitchenState={restaurant.getRef('KitchenState').observeValue}
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
    </OnoRestaurantContext.Consumer>
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

function atDataToMenu(atData) {
  if (!atData) {
    return [];
  }
  const Recipes = atData.baseTables['Recipes'];
  const MenuItemsUnordered = atData.baseTables['Kiosk Menu'];
  const RecipeIngredients = atData.baseTables['Recipe Ingredients'];
  const Ingredients = atData.baseTables['Ingredients'];

  const Customization = {};
  Object.keys(Ingredients).forEach(IngredientId => {
    const Ingredient = Ingredients[IngredientId];
    Ingredient.CustomizationCategory &&
      Ingredient.CustomizationCategory.forEach(categoryName => {
        const c =
          Customization[categoryName] || (Customization[categoryName] = []);
        c.push(Ingredient);
      });
  });

  const MenuItems = sortByField(MenuItemsUnordered, '_index');
  const ActiveMenuItems = MenuItems.filter(i => i['Active in Kiosk']);
  const ActiveItemsWithRecipe = ActiveMenuItems.map(item => {
    const Recipe = Recipes && item.Recipe && Recipes[item.Recipe[0]];

    return {
      ...item,
      Customization,
      Recipe: {
        ...Recipe,
        Ingredients: Recipe.Ingredients.map(RecipeIngredientId => {
          const ri = RecipeIngredients[RecipeIngredientId];
          if (!ri || !ri.Ingredient) {
            return null;
          }
          return {
            ...ri,
            Ingredient: Ingredients[ri.Ingredient[0]],
          };
        }).filter(v => !!v),
      },
    };
  });
  return ActiveItemsWithRecipe;
}

function atDataToMenuItemMapper(menuItemId) {
  return atData => {
    const menu = atDataToMenu(atData);
    return menu.find(item => item.id === menuItemId);
  };
}

const TAX_RATE = 0.09;

export function withPendingOrder(Component) {
  const ComponentWithOrder = withObservables(
    ['order', 'atData'],
    ({ order, atData }) => ({
      order: order,
      orderWithMenu: order.switchMap(o => {
        return (
          atData &&
          atData.map(at => {
            if (!o || !o.items) {
              return o;
            }
            const menu = atDataToMenu(at);
            console.log('zooom', o, menu);
            let subTotal = 0;
            const items = Object.keys(o.items).map(itemId => {
              const item = o.items[itemId];
              const menuItem = menu.find(i => i.id === item.menuItemId);
              subTotal += menuItem.Recipe['Sell Price'];
              return {
                ...item,
                menuItem,
              };
            });
            const tax = subTotal * TAX_RATE;
            const total = subTotal + tax;
            return { ...o, items, subTotal, tax, total, taxRate: TAX_RATE };
          })
        );
      }),
    }),
  )(Component);

  return props => (
    <OnoRestaurantContext.Consumer>
      {restaurant => (
        <ComponentWithOrder
          order={restaurant.getRef('PendingOrder').observeValue}
          atData={restaurant
            .getRef('Airtable')
            .observeConnectedValue(['files', 'db.json', 'id'])}
          {...props}
        />
      )}
    </OnoRestaurantContext.Consumer>
  );
}

export function withMenuItem(Component) {
  const ComponentWithObservedState = withObservables(
    ['atData', 'menuItemId'],
    ({ atData, menuItemId }) => ({
      menuItem: atData.map(atDataToMenuItemMapper(menuItemId)),
    }),
  )(Component);

  return props => (
    <OnoRestaurantContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          atData={restaurant
            .getRef('Airtable')
            .observeConnectedValue(['files', 'db.json', 'id'])}
          {...props}
        />
      )}
    </OnoRestaurantContext.Consumer>
  );
}

export function withMenu(Component) {
  const ComponentWithObservedState = withObservables(
    ['atData'],
    ({ atData }) => ({ menu: atData.map(atDataToMenu) }),
  )(Component);

  return props => (
    <OnoRestaurantContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          atData={restaurant
            .getRef('Airtable')
            .observeConnectedValue(['files', 'db.json', 'id'])}
          {...props}
        />
      )}
    </OnoRestaurantContext.Consumer>
  );
}

export function withDispatch(Component) {
  return props => (
    <OnoRestaurantContext.Consumer>
      {restaurant => <Component dispatch={restaurant.dispatch} {...props} />}
    </OnoRestaurantContext.Consumer>
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
    <OnoRestaurantContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          kitchenLog={restaurant.getRef('KitchenLog').observeValue}
          {...props}
        />
      )}
    </OnoRestaurantContext.Consumer>
  );
}

export function withRestaurant(Component) {
  const ComponentWithObservedState = withObservables(
    ['restaurant', 'order'],
    ({ restaurant, order }) => {
      return { restaurant, order };
    },
  )(Component);

  return props => (
    <OnoRestaurantContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          restaurantClient={restaurant}
          cloud={restaurant}
          restaurant={restaurant.getRef('Restaurant').observeValue}
          order={restaurant.getRef('PendingOrder').observeValue}
          setAppUpsellPhoneNumber={number => {
            restaurant
              .dispatch({
                type: 'PutAuthMethod',
                verificationInfo: { number, context: 'AppUpsell' },
              })
              .catch(console.error);
          }}
          setOrderName={name => {
            restaurant
              .getRef('PendingOrder')
              .transact(lastState => ({
                ...lastState,
                name,
              }))
              .catch(console.error);
          }}
          setOrderItem={(itemId, item) => {
            restaurant
              .getRef('PendingOrder')
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
            restaurant
              .getRef('Restaurant')
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
          dispatch={restaurant.dispatch}
          {...props}
        />
      )}
    </OnoRestaurantContext.Consumer>
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
