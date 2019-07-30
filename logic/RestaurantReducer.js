import { defineCloudReducer } from '../cloud-core/KiteReact';

const PRIMING_TASKS = [
  {
    deliveryMode: 'ditch',
    skipBlend: true,
    name: 'Mr. Purge',
    blendName: 'Do not eat',
    fills: [
      { system: 4, slot: 3, amount: 10 },
      { system: 3, slot: 0, amount: 2 }, // powder. 20g/shot, powdery
    ],
  },
  {
    deliveryMode: 'ditch',
    skipBlend: true,
    name: 'Mr. Purge',
    blendName: 'Do not eat',
    fills: [
      { system: 4, slot: 3, amount: 10 },
      { system: 3, slot: 1, amount: 1 }, // marine collagen. 12g/shot, runny
      { system: 3, slot: 2, amount: 10 }, // matcha. 3g/shot, powdery
    ],
  },
];

function RestaurantReducerFn(state = {}, action) {
  const defaultReturn = () => {
    return {
      ...state,
      actionCount: (state.actionCount || 0) + 1,
    };
  };

  switch (action.type) {
    case 'WipeState': {
      return {
        actionCount: 0,
      };
    }
    case 'QueueTask': {
      return {
        ...defaultReturn(),
        queue: [...(state.queue || []), action.item],
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
        queue: (state.queue || []).filter(order => order.id !== action.id),
      };
    }
    case 'DidGetCup': {
      const cupInventory = state.cupInventory || {};
      const estimatedRemaining = cupInventory.estimatedRemaining;
      const newEstimatedRemaining =
        estimatedRemaining == null ? null : estimatedRemaining - 1;
      if (!state.queue || !state.queue.length) {
        return {
          ...defaultReturn(),
          fill: null,
        };
      }
      const topTask = state.queue[0];
      return {
        ...defaultReturn(),
        cupInventory: {
          ...cupInventory,
          estimatedRemaining: newEstimatedRemaining,
        },
        fill: {
          task: topTask,
          taskStartTime: Date.now(),
          fillsRemaining: topTask.fills,
          fillsCompleted: [],
        },
        queue: state.queue.slice(1),
      };
    }
    case 'RequestFillDrop': {
      if (!state.fill) {
        return defaultReturn();
      }
      return {
        ...defaultReturn(),
        fill: { ...state.fill, requestedDropTime: Date.now() },
      };
    }
    case 'DidLooseFillCup': {
      if (!state.fill) {
        return defaultReturn();
      }
      let queue = state.queue;
      if (!action.didCompleteJob && state.fill && state.fill.task) {
        queue = [state.fill.task, ...state.queue];
      }
      return {
        ...defaultReturn(),
        fill: null,
        queue,
        lostFills: [
          ...(state.lostFills || []),
          {
            ...(state.fill || {}),
            didCompleteJob: action.didCompleteJob,
            fillLossTime: Date.now(),
          },
        ],
      };
    }
    case 'DidFill': {
      if (!state.fill) {
        return defaultReturn();
      }
      let completedFill = {
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
          completedFill = fill;
        }
        return !isTheFill;
      });
      let ingredientInventory = state.ingredientInventory;
      if (ingredientInventory && completedFill.slotId) {
        const slotInventoryState =
          ingredientInventory[completedFill.slotId] || {};
        const estimatedRemaining = slotInventoryState.estimatedRemaining;
        const newEstimatedRemaining =
          estimatedRemaining == null
            ? null
            : estimatedRemaining - completedFill.amount;
        ingredientInventory = {
          ...(state.ingredientInventory || {}),
          [completedFill.slotId]: {
            ...slotInventoryState,
            estimatedRemaining: newEstimatedRemaining,
          },
        };
      }
      return {
        ...defaultReturn(),
        ingredientInventory,
        fill: {
          ...state.fill,
          fillsCompleted: [...(state.fill.fillsCompleted || []), completedFill],
          fillsRemaining,
        },
      };
    }
    case 'DidFillSlot': {
      const ingredientInventory = state.ingredientInventory || {};
      return {
        ...defaultReturn(),
        ingredientInventory: {
          ...ingredientInventory,
          [action.slotId]: {
            ...(ingredientInventory[action.slotId] || {}),
            estimatedRemaining: action.estimatedRemaining,
          },
        },
      };
    }
    case 'DidFillCups': {
      return {
        ...defaultReturn(),
        cupInventory: {
          ...(state.cupInventory || {}),
          estimatedRemaining: action.estimatedRemaining,
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
    case 'DidPassToDelivery': {
      if (!state.blend) {
        return defaultReturn();
      }
      const blendState = state.blend;
      return {
        ...defaultReturn(),
        blend: action.didDirtyBlender ? 'dirty' : null,
        deliveryA: {
          ...blendState,
          deliverTime: Date.now(),
        },
      };
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
      if (action.bayId === 'deliveryA') {
        return { ...defaultReturn(), deliveryA: null };
      }
      if (action.bayId === 'deliveryB') {
        return { ...defaultReturn(), deliveryB: null };
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
