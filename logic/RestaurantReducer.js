import defineCloudReducer from '../cloud-core/defineCloudReducer';

function RestaurantReducerFn(state = {}, action) {
  switch (action.type) {
    case 'WipeState': {
      return {};
    }
    case 'PlaceOrder': {
      return {
        ...state,
        queue: [...(state.queue || []), action.order],
      };
    }
    case 'CancelOrder': {
      return {
        ...state,
        queue: (state.queue || []).filter(order => order.id !== action.id),
      };
    }
    case 'RequestFillDrop': {
      if (!state.fill) {
        return state;
      }
      return {
        ...state,
        fill: { ...state.fill, requestDrop: true },
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
          fillsRemaining: topOrder.fills,
          fillsCompleted: [],
        },
        queue: state.queue.slice(1),
      };
    }
    case 'DeliveredToBlender': {
      if (!state.fill) {
        return state;
      }
      const fillingState = state.fill;
      return {
        ...state,
        fill: null,
        deliveryA: fillingState,
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
