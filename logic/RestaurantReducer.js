export default function RestaurantReducer(state = {}, action) {
  switch (action.type) {
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
      return;
    }
  }
}
