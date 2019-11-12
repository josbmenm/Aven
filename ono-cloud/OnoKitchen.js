import mapObject from 'fbjs/lib/mapObject';
import React, { useMemo } from 'react';
import { useCloud, useCloudValue, useValue } from '../cloud-core/KiteReact';
import { useRestaurantState } from './Kitchen';
import {
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
  getFillsOfOrderItem,
} from '../logic/configLogic';
import { getCupsInventoryState } from '../logic/KitchenState';

export function getLocalName(name) {
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

export function getSubsystemAlarms(system) {
  // copy-pasted from getSubsystemFaults!!
  let alarms = null;

  if (system.reads.NoAlarms && system.reads.NoAlarms.value !== true) {
    // system has alarming behavior
    alarms = [];
    let alarmsUnreadable;
    const alarmed = Array(4)
      .fill(0)
      .map((_, alarmIntIndex) => {
        if (!system.reads[`Alarm${alarmIntIndex}`]) {
          return Array(16).fill(0);
        }
        try {
          return system.reads[`Alarm${alarmIntIndex}`].value
            .toString(2)
            .split('')
            .reverse()
            .map(v => v === '1');
        } catch (e) {
          alarmsUnreadable = true;
          return false;
        }
      });

    alarmsUnreadable && alarms.push(`Unable to read alarms of ${system.name}`);
    if (alarmed[0][0]) {
      alarms.push(
        'Watchdog timout on step ' + system.reads.WatchDogFrozeAt.value,
      );
    }
    system.alarms &&
      system.alarms.forEach(f => {
        const faultDintArray = alarmed[f.intIndex];
        const isAlarmed = faultDintArray && faultDintArray[f.bitIndex];
        if (isAlarmed) {
          alarms.push(f.description);
        }
      });
  }
  if (alarms && !alarms.length) {
    alarms.push('Unknown Alarm');
  }
  return alarms;
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
  if (system.reads.Homed && system.reads.Homed.value === false) {
    if (!faults) {
      faults = ['Not Homed'];
    } else if (!faults.length) {
      faults.push('Not Homed');
    }
  }
  if (faults && !faults.length) {
    faults.push('Unknown Fault');
  }
  return faults;
}

export function useCompanyConfig() {
  return useCloudValue('CompanyConfig');
}

export function useSelectedIngredients(menuItem, item) {
  const companyConfig = useCompanyConfig();

  return getSelectedIngredients(menuItem, item, companyConfig);
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

function getInventoryState(restaurantState, kitchenState) {
  if (!kitchenState || !restaurantState) {
    return {};
  }
  const slots = {};

  return {
    cups: getCupsInventoryState(kitchenState),
    slots,
  };
}

export function useInventoryState() {
  const cloud = useCloud();
  const config = useCompanyConfig();
  const kitchenState = useCloudValue('KitchenState');
  const [restaurantState, dispatch] = useRestaurantState();
  const inventoryState = getInventoryState(restaurantState, kitchenState);
  const tables = config && config.baseTables;
  if (!tables || !restaurantState) {
    return [null, dispatch];
  }
  const kitchenSlots = Object.values(tables.KitchenSlots).map(slot => {
    const Ingredient =
      tables.Ingredients[slot.Ingredient && slot.Ingredient[0]];
    const KitchenSystem =
      tables.KitchenSystems[slot.KitchenSystem && slot.KitchenSystem[0]];
    return {
      ...slot,
      Ingredient,
      KitchenSystem,
    };
  });
  const cupInventory = inventoryState.cups || {};
  function slotOfSlot(systemName, index) {
    const slot = kitchenSlots.find(
      s => s.KitchenSystem.Name === systemName && index === s.Slot,
    );
    if (!slot) {
      return null;
    }
    const settings =
      (restaurantState.slotSettings && restaurantState.slotSettings[slot.id]) ||
      {};
    const invState =
      restaurantState.slotInventory && restaurantState.slotInventory[slot.id];
    const dispensedSinceLow =
      kitchenState &&
      kitchenState[
        `${slot.KitchenSystem.Name}_Slot_${slot.Slot}_DispensedSinceLow_READ`
      ];
    const isLowSensed =
      kitchenState &&
      kitchenState[`${slot.KitchenSystem.Name}_Slot_${slot.Slot}_IsLow_READ`];
    const isErrored =
      kitchenState &&
      kitchenState[`${slot.KitchenSystem.Name}_Slot_${slot.Slot}_Error_READ`];
    const estimatedRemaining = (invState && invState.estimatedRemaining) || 0;
    const hopperDisabled =
      slot.KitchenSystem.Name === 'FrozenFood' &&
      kitchenState &&
      !kitchenState[`FrozenFood_Slot${slot.Slot}EnableHopper_VALUE`];
    const pumpDisabled =
      slot.KitchenSystem.Name === 'Beverage' &&
      kitchenState &&
      !kitchenState[`Beverage_Slot${slot.Slot}EnablePump_VALUE`];
    async function dispenseSlotAmount(amount) {
      await cloud.dispatch({
        type: 'KitchenCommand',
        commandType: 'DispenseOnly',
        params: {
          slotId: slot.id,
          amount: amount,
          slot: slot.Slot,
          system: slot.KitchenSystem.FillSystemID,
          ingredientId: slot.Ingredient.id,
          ingredientName: slot.Ingredient.Name,
          systemName: slot.KitchenSystem.Name,
        },
      });
      await dispatch({
        type: 'DidDispense',
        slotId: slot.id,
        amount: amount,
      });
    }
    return {
      ...slot,
      estimatedRemaining,
      settings,
      isLowSensed,
      isErrored,
      hopperDisabled,
      pumpDisabled,
      isEmpty: estimatedRemaining <= 0,
      dispensedSinceLow,
      name: `${slot.KitchenSystem.Name} ${slot.Slot}`,
      ingredientName: slot.Ingredient.Name,
      ingredientId: slot.Ingredient.id,
      trackFilling: true,
      onDispense: dispenseSlotAmount,
      onPurgeSmall: async () => {
        const amount = 40;
        await dispenseSlotAmount(amount);
      },
      onPurgeLarge: async () => {
        const amount = 120;
        await dispenseSlotAmount(amount);
      },
      onAddToEstimatedRemaining: value => {
        return dispatch({
          type: 'DidFillSlot',
          slotId: slot.id,
          estimatedRemaining: estimatedRemaining + value,
        });
      },
      onSetEstimatedRemaining: value => {
        return dispatch({
          type: 'DidFillSlot',
          slotId: slot.id,
          estimatedRemaining: value,
        });
      },
    };
  }
  const inventorySystems = [
    {
      id: 'Cups',
      name: 'Cups',
      estimatedRemaining: cupInventory.estimatedRemaining,
      isEmpty: cupInventory.isEmpty,
      isErrored: cupInventory.isErrored,
    },
    {
      id: 'Beverage',
      name: 'Beverage',
      slots: Array(4)
        .fill()
        .map((_, i) => slotOfSlot('Beverage', i))
        .filter(Boolean),
    },
    {
      id: 'Powder',
      name: 'Powder',
      slots: Array(3)
        .fill()
        .map((_, i) => slotOfSlot('Powder', i))
        .filter(Boolean),
    },
    {
      id: 'Piston',
      name: 'Piston',
      slots: Array(2)
        .fill()
        .map((_, i) => slotOfSlot('Piston', i))
        .filter(Boolean),
    },
    {
      id: 'FrozenFood',
      name: 'FrozenFood',
      slots: Array(9)
        .fill()
        .map((_, i) => slotOfSlot('FrozenFood', i))
        .filter(Boolean),
    },
    {
      id: 'Granules',
      name: 'Granules',
      slots: Array(6)
        .fill()
        .map((_, i) => slotOfSlot('Granules', i))
        .filter(Boolean),
    },
  ];
  // const inventorySlots = [
  //   {
  //     id: 'cups',
  //     name: 'Cups',
  //     settings: {},
  //     disableFilling: true,
  //     isCups: true,
  //     estimatedRemaining: cupInventory.estimatedRemaining,
  //     isEmpty: cupInventory.isEmpty,
  //     isErrored: cupInventory.isErrored,
  //     ShotCapacity: 50,
  //     ShotsAfterLow: 18,
  //     onDispenseOne: async () => {
  //       await cloud.dispatch({
  //         type: 'KitchenCommand',
  //         commandType: 'DispenseCup',
  //       });
  //       await dispatch({
  //         type: 'DidDispenseCup',
  //       });
  //     },
  //   },

  //   ...ingredientSlots.map(slot => {
  //     const invState =
  //       restaurantState.slotInventory && restaurantState.slotInventory[slot.id];
  //     const dispensedSinceLow =
  //       kitchenState &&
  //       kitchenState[
  //         `${slot.KitchenSystem.Name}_Slot_${slot.Slot}_DispensedSinceLow_READ`
  //       ];
  //     const isLowSensed =
  //       kitchenState &&
  //       kitchenState[`${slot.KitchenSystem.Name}_Slot_${slot.Slot}_IsLow_READ`];
  //     const isErrored =
  //       kitchenState &&
  //       kitchenState[`${slot.KitchenSystem.Name}_Slot_${slot.Slot}_Error_READ`];

  //     const estimatedRemaining = (invState && invState.estimatedRemaining) || 0;
  //     return {
  //       ...slot,
  //       settings:
  //         (restaurantState.slotSettings &&
  //           restaurantState.slotSettings[slot.id]) ||
  //         {},
  //       estimatedRemaining,
  //       dispensedSinceLow,
  //       isEmpty: false,
  //       isErrored,
  //       isLowSensed,
  //       name: slot.Ingredient.Name,
  //       photo: slot.Ingredient.Icon,
  //       color: slot.Ingredient.Color,
  //       ingredientId: slot.Ingredient.id,

  //     };
  //   }),
  // ];

  const inventoryIngredients = {};
  inventorySystems.forEach(invSystem => {
    invSystem.slots &&
      invSystem.slots.forEach(invState => {
        if (invState && invState.ingredientId) {
          inventoryIngredients[invState.ingredientId] = invState;
        }
      });
  });

  return [{ inventorySystems, inventoryIngredients }, dispatch];
}

function getMenuItemInventory(menuItem, companyConfig, inventoryIngredients) {
  if (!inventoryIngredients) {
    return menuItem;
  }
  const stockItemFills = getFillsOfOrderItem(
    menuItem,
    { customization: null },
    companyConfig,
  );
  let isOutOfStock = false;

  const stockItemFillsWithInventory = stockItemFills.map(fillSpec => {
    const ing = inventoryIngredients[fillSpec.ingredientId];
    let isIngredientOutOfStock = false;
    if (!ing || fillSpec.amount > ing.estimatedRemaining) {
      isIngredientOutOfStock = true;
    }
    if (isIngredientOutOfStock && (!ing || !ing.settings.optional)) {
      isOutOfStock = true;
    }
    return {
      ...fillSpec,
      inventory: ing,
      isOutOfStock: isIngredientOutOfStock,
    };
  });
  return {
    ...menuItem,
    stockItemFills: stockItemFillsWithInventory,
    inStockFills: stockItemFillsWithInventory.filter(
      fillSpec => !fillSpec.isOutOfStock,
    ),
    isOutOfStock,
    inventoryIngredients,
  };
}

export function useInventoryIngredients() {
  const [invState] = useInventoryState();
  return invState && invState.inventoryIngredients;
}

export function useInventoryMenuItem(menuItemId) {
  const config = useCompanyConfig();
  const inventoryIngredients = useInventoryIngredients();
  return useMemo(() => {
    if (!config || !menuItemId || !inventoryIngredients) return {};
    const menuItem = companyConfigToBlendMenuItemMapper(menuItemId)(config);
    return {
      menuItem: getMenuItemInventory(menuItem, config, inventoryIngredients),
      inventoryIngredients,
    };
  }, [config, menuItemId, inventoryIngredients]);
}

export function useInventoryMenu() {
  const companyConfig = useCompanyConfig();
  const menu = companyConfigToMenu(companyConfig);
  const inventoryIngredients = useInventoryIngredients();
  if (!inventoryIngredients) {
    return menu;
  }
  return {
    ...menu,
    blends: menu.blends.map(menuItem => {
      return getMenuItemInventory(
        menuItem,
        companyConfig,
        inventoryIngredients,
      );
    }),
  };
}

export function useInStockInventoryMenu() {
  const menu = useInventoryMenu();
  return React.useMemo(() => {
    if (!menu) return menu;
    return {
      ...menu,
      blends: menu.blends.filter(
        blend => !blend.isOutOfStock || blend['Forced Available'],
      ),
    };
  }, [menu]);
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
  const valueCommands = mapObject(
    ss.valueCommands,
    (commandedValues, tagName) => {
      const internalTagName = `${subsystemName}_${tagName}_VALUE`;
      const value = kitchenState[internalTagName];
      const outCmd = { ...commandedValues, value, name: tagName };
      return outCmd;
    },
  );
  const noFaults = reads.NoFaults ? reads.NoFaults.value : null;
  return {
    icon: ss.icon,
    valueCommands,
    pulseCommands: ss.pulseCommands,
    name: subsystemName,
    noFaults,
    reads,
    faults: ss.faults,
    alarms: ss.alarms,
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
