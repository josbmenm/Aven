import defineCloudReducer from '../cloud-core/defineCloudReducer';

function RestaurantReducerFn(state = {}, action) {
  switch (action.type) {
    case 'WipeState': {
      return {};
    }
    case 'QueueOrderItem': {
      return {
        ...state,
        queue: [...(state.queue || []), action.item],
      };
    }
    case 'CancelOrder': {
      return {
        ...state,
        queue: (state.queue || []).filter(order => order.id !== action.id),
      };
    }
    case 'StartedOrder': {
      if (!state.queue || !state.queue.length) {
        return {
          ...state,
          fill: {},
        };
      }
      const topOrder = state.queue[0];
      return {
        ...state,
        fill: {
          order: topOrder,
          orderStartTime: Date.now(),
          fillsRemaining: topOrder.fills,
          fillsCompleted: [],
        },
        queue: state.queue.slice(1),
      };
    }
    case 'RequestFillDrop': {
      if (!state.fill) {
        return state;
      }
      return {
        ...state,
        fill: { ...state.fill, requestedDropTime: Date.now() },
      };
    }
    case 'DroppedFill': {
      if (!state.fill) {
        return state;
      }
      let queue = state.queue;
      if (state.fill.order) {
        queue = [state.fill.order, ...state.queue];
      }
      return {
        ...state,
        fill: null,
        queue,
      };
    }
    case 'DidFill': {
      if (!state.fill) {
        return state;
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
      return {
        ...state,
        fill: {
          ...state.fill,
          fillsCompleted: [...(state.fill.fillsCompleted || []), completedFill],
          fillsRemaining,
        },
      };
    }

    case 'DidPassToBlender': {
      if (!state.fill) {
        return state;
      }
      const fillState = state.fill;
      return {
        ...state,
        blend: {
          ...fillState,
          passToBlenderTime: Date.now(),
        },
        fill: null,
      };
    }
    case 'DidBlend': {
      if (!state.blend) {
        return state;
      }
      return {
        ...state,
        blend: {
          ...state.blend,
          blendCompleteTime: Date.now(),
        },
      };
    }
    case 'DidPassToDelivery': {
      if (!state.blend) {
        return state;
      }
      const blendState = state.blend;
      return {
        ...state,
        blend: null,
        deliveryA: {
          deliverTime: Date.now(),
          ...blendState,
        },
      };
    }
    case 'ClearDeliveryBay': {
      if (action.bayId === 'deliveryA') {
        return { ...state, deliveryA: null };
      }
      if (action.bayId === 'deliveryB') {
        return { ...state, deliveryB: null };
      }
      return state;
    }
    case 'StartAutorun': {
      return {
        ...state,
        isAutoRunning: true,
      };
    }
    case 'PauseAutorun': {
      return {
        ...state,
        isAutoRunning: false,
      };
    }
    default: {
      return state;
    }
  }
}

const RestaurantReducer = defineCloudReducer(
  'RestaurantReducer',
  RestaurantReducerFn,
  {},
);

export default RestaurantReducer;
