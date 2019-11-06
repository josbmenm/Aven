import { defineCloudReducer } from '../cloud-core/KiteReact';
import cuid from 'cuid';

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

function taskCompleteTime(prevState, action) {
  const taskCompleteTime = action.dispatchTime;
  const duration = prevState
    ? (taskCompleteTime - prevState.taskStartTime) / 1000
    : undefined;
  return {
    taskCompleteTime,
    duration,
  };
}

function handleDisabledFills(state) {
  if (!state.fill) {
    return state;
  }
  const { fillsCompleted, fillsRemaining, fillsFailed } = state.fill;
  if (!fillsRemaining) {
    return state;
  }
  const nextFill = fillsRemaining[0];
  if (!nextFill) {
    return state;
  }
  const { ingredientId, amount } = nextFill;

  if (restaurantStateHasInventory(state, ingredientId, amount)) {
    return state;
  }

  console.log('checking fill');

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
        fill: {
          id: topTask.id,
          task: topTask,
          taskStartTime: action.dispatchTime,
          fillsRemaining: topTask.fills,
          fillsCompleted: [],
        },
        queue: state.queue.slice(1),
      });
    }
    case 'WipeBlendTaskState': {
      if (!state.blend) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        blend: null,
        completedTasks: [
          ...(state.completedTasks || []),
          {
            ...state.blend,
            deliveryType: 'wiped-blend-state',
            deliveryTime: action.dispatchTime,
            ...taskCompleteTime(state.blend, action),
          },
        ],
      };
    }
    case 'WipeFillTaskState': {
      if (!state.fill || state.fill === 'ready') {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        fill: null,
        completedTasks: [
          ...(state.completedTasks || []),
          {
            ...state.fill,
            deliveryType: 'wiped-fill-state',
            deliveryTime: action.dispatchTime,
            ...taskCompleteTime(state.fill, action),
          },
        ],
      };
    }
    case 'RequestFillDrop': {
      if (!state.fill) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        fill: {
          ...state.fill,
          requestedDropTime: action.dispatchTime,
        },
      };
    }
    case 'DidLooseFillCup': {
      if (!state.fill || state.fill === 'ready') {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        fill: null,
        completedTasks: [
          ...(state.completedTasks || []),
          {
            ...state.fill,
            deliveryType: 'drop-fill',
            deliveryTime: action.dispatchTime,
            ...taskCompleteTime(state.fill, action),
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
        completedFillTime: action.dispatchTime,
        isDryRunDispense: true,
      };
      let fillsRemaining = (state.fill.fillsRemaining || []).filter(fill => {
        const isTheFill =
          action.system === fill.system &&
          action.amount === fill.amount &&
          action.slot === fill.slot;
        if (isTheFill) {
          completedFill = {
            ...fill,
            completedFillTime: action.dispatchTime,
            isDryRunDispense: true,
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
        failedFillTime: action.dispatchTime,
        system: action.system,
        amount: action.amount,
        slot: action.slot,
        isInvalid: action.isInvalid,
        isDisabled: action.isDisabled,
        isEmpty: action.isEmpty,
      };
      let fillsRemaining = (state.fill.fillsRemaining || []).filter(fill => {
        const isTheFill =
          action.system === fill.system &&
          action.amount === fill.amount &&
          action.slot === fill.slot;
        if (isTheFill) {
          failedFill = { ...fill, failedFillTime: action.dispatchTime };
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
        completedFillTime: action.dispatchTime,
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
          completedFill = { ...fill, completedFillTime: action.dispatchTime };
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
    case 'WillPassToBlender': {
      if (!state.fill) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        fill: { ...state.fill, willPassToBlender: action.dispatchTime },
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
          passToBlenderTime: action.dispatchTime,
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
          blendCompleteTime: action.dispatchTime,
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
          moveToBlenderTime: action.dispatchTime,
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
    case 'WillPassToDelivery': {
      if (!state.blend) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        blend: {
          ...state.blend,
          willPassToDelivery: action.dispatchTime,
        },
      };
    }
    case 'DidPassToDelivery': {
      if (!state.blend) {
        return defaultReturn();
      }
      const blendState = state.blend;
      return {
        ...defaultReturn(),
        blend: blendState.blendCompleteTime ? 'dirty' : null,
        delivery: {
          ...blendState,
          passToDeliveryTime: action.dispatchTime,
        },
      };
    }
    case 'ObserveUnknownBlenderCup': {
      if (state.blend && state.blend !== 'dirty') {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        blend: {
          id: cuid(),
          task: null,
        },
      };
    }
    case 'ObserveUnknownDeliveryCup': {
      if (state.delivery) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        delivery: {
          id: cuid(),
          task: null,
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
            deliveryTime: action.dispatchTime,
            ...taskCompleteTime(state.delivery, action),
          },
        ],
      };
    }
    case 'WillDeliver': {
      if (!state.delivery) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        delivery: {
          ...state.delivery,
          willDeliverTo: action.bayId,
        },
      };
    }
    case 'DidDeliver': {
      if (!state.delivery || !state.delivery.task) {
        return defaultReturn();
      }
      const deliveredState = {
        ...state.delivery,
        deliveryType: 'delivered',
        bayId: action.bayId,
        deliveryTime: action.dispatchTime,
        ...taskCompleteTime(state.delivery, action),
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
      const unacknowledgedFaults = (state.restaurantFaults || []).filter(
        f => f.ackTime === 0,
      );
      if (!action.force && unacknowledgedFaults.length) {
        return {
          ...defaultReturn(),
          restaurantFaults: unacknowledgedFaults,
        };
      }
      return {
        ...defaultReturn(),
        isAutoRunning: true,
        restaurantFaults: [],
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
        manualMode: false,
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
    case 'SetMaintenanceMode': {
      return { ...defaultReturn(), maintenanceMode: action.maintenanceMode };
    }
    case 'CloseRestaurant': {
      return {
        ...defaultReturn(),
        sessionName: null,
        isClosed: true,
        maintenanceMode: false,
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
        maintenanceMode: false,
        sessionName: action.sessionName,
        scheduledCloseTime: action.scheduledCloseTime || null,
      };
    }
    case 'CleanupTask': {
      return {
        ...defaultReturn(),
        completedTasks: (state.completedTasks || []).filter(
          task => task.id !== action.taskId,
        ),
        failedTasks: (state.failedTasks || []).filter(
          task => task.id !== action.taskId,
        ),
      };
    }
    case 'SetRestaurantFault': {
      return {
        ...defaultReturn(),
        isAutoRunning: false,
        restaurantFaults: [
          ...(state.restaurantFaults || []),
          {
            restaurantFaultType: action.restaurantFaultType,
            ackTime: action.requiresAck ? 0 : undefined,
            time: action.dispatchTime,
            key: action.dispatchId,
          },
        ],
      };
    }
    case 'AckFault': {
      return {
        ...defaultReturn(),
        restaurantFaults: (state.restaurantFaults || []).map(fault => {
          if (action.key !== fault.key) return fault;
          return {
            ...fault,
            ackTime: action.dispatchTime,
          };
        }),
      };
    }
    case 'SetFaultMuting': {
      const faultMuting = { ...state.faultMuting };
      Object.entries(action.faultMuting).forEach(([alarmKey, isMuted]) => {
        faultMuting[alarmKey] = isMuted ? true : undefined;
      });
      return {
        ...defaultReturn(),
        faultMuting,
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
