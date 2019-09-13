import { defineCloudReducer } from '../cloud-core/KiteReact';

const PRIMING_TASKS = [
  {
    id: 'purge-0',
    deliveryMode: 'ditch',
    skipBlend: true,
    name: 'Mr. Purge',
    blendName: 'Do not eat',
    blendColor: 'black',
    fills: [
      { system: 4, slot: 3, amount: 10 },
      { system: 3, slot: 0, amount: 2 }, // powder. 20g/shot, powdery
    ],
  },
  {
    id: 'purge-1',
    deliveryMode: 'ditch',
    skipBlend: true,
    name: 'Mr. Purge',
    blendName: 'Do not eat',
    blendColor: 'black',
    fills: [
      { system: 4, slot: 3, amount: 10 },
      { system: 3, slot: 1, amount: 1 }, // marine collagen. 12g/shot, runny
      { system: 3, slot: 2, amount: 10 }, // matcha. 3g/shot, powdery
    ],
  },
];

function restaurantStateHasInventory(state, ingredientId, amount) {
  // todo!
  return true;
}

function handleDisabledFills(state) {
  if (!state.fill) {
    return state;
  }
  const { fillsCompleted, fillsRemaining, fillsFailed } = state.fill;
  const nextFill = fillsRemaining[0];
  if (!nextFill) {
    return state;
  }
  const { ingredientId, amount } = nextFill;

  if (restaurantStateHasInventory(state, ingredientId, amount)) {
    return state;
  }

  return handleDisabledFills({
    ...state,
    fill: {
      ...state.fill,
      fillsRemaining: fillsRemaining.slice(1),
      fillsFailed: [...(fillsFailed || []), nextFill],
    },
  });
}

function withdrawInventoryIngredient(state, slotId, amount) {
  let slotInventory = state.slotInventory;
  if (slotInventory && slotId) {
    const slotInventoryState = slotInventory[slotId] || {};
    const estimatedRemaining = slotInventoryState.estimatedRemaining;
    const newEstimatedRemaining =
      estimatedRemaining == null ? null : estimatedRemaining - amount;
    slotInventory = {
      ...(state.slotInventory || {}),
      [slotId]: {
        ...slotInventoryState,
        estimatedRemaining: newEstimatedRemaining,
      },
    };
  }
  return slotInventory;
}

function withdrawInventoryCup(state) {
  const lastInventory = state.cupInventory || {};
  const estimatedRemaining = lastInventory.estimatedRemaining;
  const newEstimatedRemaining =
    estimatedRemaining == null ? null : estimatedRemaining - 1;

  const cupInventory = {
    ...lastInventory,
    estimatedRemaining: newEstimatedRemaining,
  };
  return cupInventory;
}

function RestaurantReducerFn(state = {}, action) {
  const defaultReturn = () => {
    return {
      ...state,
      // lastAction: action,
      // lastLastAction: state.lastAction,
      actionCount: (state.actionCount || 0) + 1,
    };
  };

  switch (action.type) {
    case 'WipeState': {
      return {
        actionCount: 0,
        ...(action.resetState || {}),
      };
    }
    case 'QueueTasks': {
      return {
        ...defaultReturn(),
        queue: [...(state.queue || []), ...action.tasks],
      };
    }
    case 'PrimeDispensers': {
      return {
        ...defaultReturn(),
        queue: [...PRIMING_TASKS, ...(state.queue || [])],
      };
    }
    case 'CancelTask': {
      return {
        ...defaultReturn(),
        queue: (state.queue || []).filter(task => task.id !== action.id),
      };
    }
    case 'DoTaskNext': {
      const lastQueue = state.queue || [];
      const task = lastQueue.find(t => t.id === action.id);
      if (!task) {
        return defaultReturn;
      }
      return {
        ...defaultReturn(),
        queue: [task, ...lastQueue.filter(task => task.id !== action.id)],
      };
    }
    case 'SetSlotSettings': {
      const { type, slotId, ...slotSettings } = action;
      const lastSlotSettings = state.slotSettings || {};
      return {
        ...defaultReturn(),
        slotSettings: {
          ...lastSlotSettings,
          [action.slotId]: {
            ...(lastSlotSettings[action.slotId] || {}),
            ...slotSettings,
          },
        },
      };
    }
    case 'InvalidateQueuedTask': {
      const invalidTask = (state.queue || []).find(
        task => task.id === action.taskId,
      );
      if (!invalidTask) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        queue: (state.queue || []).filter(t => t !== invalidTask),
        invalidTasks: [invalidTask, ...(state.invalidTasks || [])],
      };
    }
    case 'DidStartCup': {
      if (!state.queue || !state.queue.length) {
        return {
          ...defaultReturn(),
          fill: null,
        };
      }
      const topTask = state.queue[0];
      return handleDisabledFills({
        ...defaultReturn(),
        cupInventory: withdrawInventoryCup(state),
        fill: {
          task: topTask,
          taskStartTime: Date.now(),
          fillsRemaining: topTask.fills,
          fillsCompleted: [],
        },
        queue: state.queue.slice(1),
      });
    }
    case 'RequestFillDrop': {
      if (!state.fill) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        fill: {
          ...state.fill,
          requestedDropTime: Date.now(),
          requestedDropRemake: action.remake,
        },
      };
    }
    case 'DidLooseFillCup': {
      if (!state.fill) {
        return defaultReturn();
      }
      let queue = state.queue;
      if (!action.didCompleteTask && state.fill && state.fill.task) {
        queue = [state.fill.task, ...state.queue];
      }
      return {
        ...defaultReturn(),
        fill: null,
        queue,
        completedTasks: [
          ...(state.completedTasks || []),
          {
            ...state.fill,
            deliveryType: 'drop-fill',
            deliveryTime: Date.now(),
            taskCompleteTime: Date.now(),
          },
        ],
      };
    }
    case 'DidDispense': {
      return {
        ...defaultReturn(),
        slotInventory: withdrawInventoryIngredient(
          state,
          action.slotId,
          action.amount,
        ),
      };
    }
    case 'DidDispenseCup': {
      return {
        ...defaultReturn(),
        cupInventory: withdrawInventoryCup(state),
      };
    }
    case 'SetDryMode': {
      return {
        ...defaultReturn(),
        isDryRunning: action.isDryRunning,
      };
    }
    case 'SetFoodMonitoring': {
      // diff previous monitors in state.foodMonitoring, create history with time
      return {
        ...defaultReturn(),
        foodMonitoring: action.foodMonitoring,
      };
    }
    case 'DidPretendFill': {
      if (!state.fill) {
        return defaultReturn();
      }
      let completedFill = {
        system: action.system,
        amount: action.amount,
        slot: action.slot,
        completedFillTime: Date.now(),
        isPretendDispense: true,
      };
      let fillsRemaining = (state.fill.fillsRemaining || []).filter(fill => {
        const isTheFill =
          action.system === fill.system &&
          action.amount === fill.amount &&
          action.slot === fill.slot;
        if (isTheFill) {
          completedFill = {
            ...fill,
            completedFillTime: Date.now(),
            isPretendDispense: true,
          };
        }
        return !isTheFill;
      });

      return handleDisabledFills({
        ...defaultReturn(),
        fill: {
          ...state.fill,
          fillsCompleted: [...(state.fill.fillsCompleted || []), completedFill],
          fillsRemaining,
        },
      });
    }
    case 'DidFailFill': {
      if (!state.fill) {
        return defaultReturn();
      }
      let failedFill = {
        failedFillTime: Date.now(),
        system: action.system,
        amount: action.amount,
        slot: action.slot,
      };
      let fillsRemaining = (state.fill.fillsRemaining || []).filter(fill => {
        const isTheFill =
          action.system === fill.system &&
          action.amount === fill.amount &&
          action.slot === fill.slot;
        if (isTheFill) {
          failedFill = { ...fill, failedFillTime: Date.now() };
        }
        return !isTheFill;
      });
      return handleDisabledFills({
        ...defaultReturn(),
        fill: {
          ...state.fill,
          fillsFailed: [...(state.fill.fillsFailed || []), failedFill],
          fillsRemaining,
        },
      });
    }
    case 'DidFill': {
      if (!state.fill) {
        return defaultReturn();
      }
      let completedFill = {
        completedFillTime: Date.now(),
        system: action.system,
        amount: action.amount,
        slot: action.slot,
      };
      let fillsRemaining = (state.fill.fillsRemaining || []).filter(fill => {
        const isTheFill =
          action.system === fill.system &&
          action.amount === fill.amount &&
          action.slot === fill.slot;
        if (isTheFill) {
          completedFill = { ...fill, completedFillTime: Date.now() };
        }
        return !isTheFill;
      });
      return handleDisabledFills({
        ...defaultReturn(),
        slotInventory: withdrawInventoryIngredient(
          state,
          completedFill.slotId,
          completedFill.amount,
        ),
        fill: {
          ...state.fill,
          fillsCompleted: [...(state.fill.fillsCompleted || []), completedFill],
          fillsRemaining,
        },
      });
    }
    case 'DidFillSlot': {
      const slotInventory = state.slotInventory || {};
      return {
        ...defaultReturn(),
        slotInventory: {
          ...slotInventory,
          [action.slotId]: {
            ...(slotInventory[action.slotId] || {}),
            estimatedRemaining: action.estimatedRemaining,
          },
        },
      };
    }
    case 'DidPassToBlender': {
      if (!state.fill) {
        return defaultReturn();
      }
      const fillState = state.fill;
      return {
        ...defaultReturn(),
        blend: {
          ...fillState,
          passToBlenderTime: Date.now(),
        },
        fill: null,
      };
    }
    case 'DidBlend': {
      if (!state.blend) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        blend: {
          ...state.blend,
          blendCompleteTime: Date.now(),
        },
      };
    }
    case 'DidFillGoToCup': {
      if (state.fill != null) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        fill: 'ready',
      };
    }
    case 'DidFillGoToHandoff': {
      if (!state.fill) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        fill: {
          ...state.fill,
          moveToBlenderTime: Date.now(),
        },
      };
    }
    case 'TravelRestaurant': {
      return {
        ...defaultReturn(),
        isClosed: true,
        isTraveling: true,
      };
    }
    case 'ParkRestaurant': {
      return {
        ...defaultReturn(),
        isTraveling: false,
      };
    }
    case 'DidPassToDelivery': {
      if (!state.blend) {
        return defaultReturn();
      }
      const blendState = state.blend;
      return {
        ...defaultReturn(),
        blend: action.didDirtyBlender ? 'dirty' : null,
        delivery: {
          ...blendState,
          passToDeliveryTime: Date.now(),
        },
      };
    }
    case 'DidDeliveryDropCup': {
      if (!state.delivery) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        delivery: null,
        completedTasks: [
          ...(state.completedTasks || []),
          {
            ...state.delivery,
            deliveryType: 'drop',
            deliveryTime: Date.now(),
            taskCompleteTime: Date.now(),
          },
        ],
      };
    }
    case 'DidDeliver': {
      if (!state.delivery) {
        return defaultReturn();
      }
      const deliveredState = {
        ...state.delivery,
        deliveryType: 'delivered',
        bayId: action.bayId,
        deliveryTime: Date.now(),
        taskCompleteTime: Date.now(),
      };
      const returnState = {
        ...defaultReturn(),
        delivery: null,
        completedTasks: [...(state.completedTasks || []), deliveredState],
      };
      if (action.bayId === 'delivery0') {
        return {
          ...returnState,
          delivery0: deliveredState,
        };
      }
      if (action.bayId === 'delivery1') {
        return {
          ...returnState,
          delivery1: deliveredState,
        };
      }
      return returnState;
    }
    case 'DidClean': {
      if (state.blend !== 'dirty') {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        blend: null,
      };
    }
    case 'ClearDeliveryBay': {
      if (action.bayId === 'delivery0') {
        return { ...defaultReturn(), delivery0: null };
      }
      if (action.bayId === 'delivery1') {
        return { ...defaultReturn(), delivery1: null };
      }
      return defaultReturn();
    }
    case 'StartAutorun': {
      return {
        ...defaultReturn(),
        isAutoRunning: true,
      };
    }
    case 'PauseAutorun': {
      return {
        ...defaultReturn(),
        isAutoRunning: false,
      };
    }
    case 'SetManualMode': {
      return {
        ...defaultReturn(),
        isManualMode: action.isManualMode,
      };
    }
    case 'Attach': {
      return {
        ...defaultReturn(),
        isAttached: true,
        isAutoRunning: false,
      };
    }
    case 'Detach': {
      return {
        ...defaultReturn(),
        isAttached: false,
      };
    }
    case 'EnableManualMode': {
      return {
        ...defaultReturn(),
        isAttached: false,
        manualMode: true,
      };
    }
    case 'DisableManualMode': {
      return {
        ...defaultReturn(),
        manualMode: false,
      };
    }
    case 'CloseRestaurant': {
      return {
        ...defaultReturn(),
        isClosed: true,
      };
    }
    case 'ScheduleRestaurantClose': {
      return {
        ...defaultReturn(),
        scheduledCloseTime: action.scheduledCloseTime,
      };
    }
    case 'OpenRestaurant': {
      return {
        ...defaultReturn(),
        isClosed: false,
        scheduledCloseTime: action.scheduledCloseTime || null,
      };
    }
    default: {
      return defaultReturn();
    }
  }
}

const RestaurantReducer = defineCloudReducer(
  'RestaurantReducer',
  RestaurantReducerFn,
  {},
);

export default RestaurantReducer;
