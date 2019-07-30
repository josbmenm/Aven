import mapObject from 'fbjs/lib/mapObject';
import React, { createContext, useContext, useState, useMemo } from 'react';
import { useCloud, useCloudValue, useValue } from '../cloud-core/KiteReact';
import {
  getOrderItemMapper,
  sortByField as getSortedByField,
  sellPriceOfMenuItem as getSellPriceOfMenuItem,
  displayNameOfMenuItem as getDisplayNameOfMenuItem,
  displayNameOfOrderItem as getDisplayNameOfOrderItem,
  getSelectedIngredients as doGetSelectedIngredients,
  getItemCustomizationSummary as doGetItemCustomizationSummary,
  getSellPriceOfItem as doGetSellPriceOfItem,
  getOrderSummary,
  companyConfigToMenu,
  companyConfigToBlendMenu,
  getMenuItemSlug,
  companyConfigToFoodMenu,
} from '../logic/configLogic';

const OrderContext = createContext(null);

function getLocalName(name) {
  const locals = name.split('/');
  return locals[locals.length - 1];
}

export const sortByField = getSortedByField;

export const getSelectedIngredients = doGetSelectedIngredients;
export const displayNameOfMenuItem = getDisplayNameOfMenuItem;
export const displayNameOfOrderItem = getDisplayNameOfOrderItem;
export const sellPriceOfMenuItem = getSellPriceOfMenuItem;
export const getItemCustomizationSummary = doGetItemCustomizationSummary;
export const getSellPriceOfItem = doGetSellPriceOfItem;

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
    let faultsUnreadable;
    const faulted = Array(4)
      .fill(0)
      .map((_, faultIntIndex) => {
        if (!system.reads[`Fault${faultIntIndex}`]) {
          return Array(16).fill(0);
        }
        try {
          return system.reads[`Fault${faultIntIndex}`].value
            .toString(2)
            .split('')
            .reverse()
            .map(v => v === '1');
        } catch (e) {
          faultsUnreadable = true;
          return false;
        }
      });

    faultsUnreadable && faults.push(`Unable to read faults of ${system.name}`);
    if (faulted[0][0]) {
      faults.push(
        'Watchdog timout on step ' + system.reads.WatchDogFrozeAt.value,
      );
    }
    system.faults &&
      system.faults.forEach(f => {
        const faultDintArray = faulted[f.intIndex];
        const isFaulted = faultDintArray && faultDintArray[f.bitIndex];
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
  let cloud = useCloud();
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

  // useEffect(() => {
  //   guardAsync(cloud.establishAnonymousSession());
  // }, []);

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
    confirmOrder: async paymentIntent => {
      let o = currentOrder;
      if (!o) {
        return;
      }
      await o.transact(doConfirmOrder);
      await cloud.dispatch({
        type: 'PlaceOrder',
        orderId: getLocalName(o.getName()),
        paymentIntent,
      });
    },
    startOrder: () =>
      guardAsync(
        (async () => {
          const order = cloud.get('PendingOrders').children.post();
          setCurrentOrder(order);
          await order.putValue({
            startTime: Date.now(),
            items: [],
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
  return useCloudValue('CompanyConfig');
}

export function useSelectedIngredients(menuItem, item) {
  const companyConfig = useCompanyConfig();

  return getSelectedIngredients(menuItem, item, companyConfig);
}

export function useOrder() {
  let orderContext = useContext(OrderContext);
  return orderContext;
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
  const observedOrder = useValue(order ? order.value : null);
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
      await order.transact(lastOrder => {
        const lastItems = (lastOrder && lastOrder.items) || [];
        const items = [...lastItems];
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
    async function removeItem() {
      await order.transact(lastOrder => {
        const lastItems = (lastOrder && lastOrder.items) || [];
        const items = lastItems.filter(i => i.id !== orderItemId);
        return {
          ...lastOrder,
          items,
        };
      });
    }
    const itemMapper = menu && getOrderItemMapper(menu);
    const orderState = order && order.value.get();

    const orderItem =
      orderState &&
      orderState.items &&
      orderState.items.find(i => i.id === orderItemId);
    const fullOrderItem = orderItem && itemMapper(orderItem);

    return {
      orderItemId,
      orderItem: fullOrderItem,
      setItemState,
      removeItem,
      order,
    };
  }, [orderItemId, order, menu]);
}

export function useKitchenConfig() {
  const kitchenConfig = useCloudValue('KitchenConfig');
  return kitchenConfig;
}
export function useKitchenState() {
  const kitchenState = useCloudValue('KitchenState');
  return kitchenState;
}

export function useSubsystemOverview() {
  const kitchenConfig = useKitchenConfig();
  const kitchenState = useKitchenState();
  return React.useMemo(
    () => getSubsystemOverview(kitchenConfig, kitchenState),
    [kitchenConfig, kitchenState],
  );
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
    cartItem.customization.enhancement &&
    menuItem &&
    menuItem.AllBenefits &&
    menuItem.AllBenefits[cartItem.customization.enhancement]
  ) {
    return menuItem.AllBenefits[cartItem.customization.enhancement];
  }
  return menuItem.DefaultBenefit;
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
export function useMenuItemSlug(menuItemSlug) {
  const companyConfig = useCompanyConfig();
  const menuItem = useMemo(() => {
    const blends = companyConfigToBlendMenu(companyConfig);
    return (
      blends &&
      blends.find(blend => {
        return getMenuItemSlug(blend) === menuItemSlug;
      })
    );
  }, [menuItemSlug, companyConfig]);
  return menuItem;
}

export function useFoodItem(foodItemId) {
  const config = useCompanyConfig();
  return useMemo(() => {
    if (!config) return null;
    return companyConfigToFoodMenuItemMapper(foodItemId)(config);
  }, [config, foodItemId]);
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
  const order = useMemo(() => cloud.get(`PendingOrders/${orderId}`), [orderId]);
  const orderState = useValue(order ? order.value : null);
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
