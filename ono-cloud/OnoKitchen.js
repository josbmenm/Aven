import OnoRestaurantContext from './OnoRestaurantContext';
import mapObject from 'fbjs/lib/mapObject';
import React from 'react';
import withObservables from '@nozbe/with-observables';
import { last } from 'rxjs/operators';

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

  const MenuItems = sortByField(MenuItemsUnordered, '_index');
  const ActiveMenuItems = MenuItems.filter(i => i['Active in Kiosk']);
  const ActiveItemsWithRecipe = ActiveMenuItems.map(item => {
    const Recipe = Recipes && item.Recipe && Recipes[item.Recipe[0]];

    return {
      ...item,
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

export function withRestaurant(Component) {
  const ComponentWithObservedState = withObservables(
    ['restaurant'],
    ({ restaurant }) => {
      return { restaurant };
    },
  )(Component);

  return props => (
    <OnoRestaurantContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          restaurant={restaurant.getRef('Restaurant').observeValue}
          placeOrder={order => {
            restaurant.getRef('Restaurant').transact(lastState => ({
              ...lastState,
              orders: [
                ...((lastState && lastState.orders) || []),
                {
                  ...order,
                  orderTime: Date.now(),
                },
              ],
            }));
          }}
          dispatch={restaurant.dispatch}
          {...props}
        />
      )}
    </OnoRestaurantContext.Consumer>
  );
}

export const getSubsystem = (subsystemName, kitchenConfig, kitchenState) => {
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
