export default function RestaurantReducer(state = {}, action) {
  switch (action.type) {
    case 'PlaceOrder': {
      return {
        ...state,
        queue: [...(state.queue || []), action.order],
      };
    }
    case '': {
      return {};
    }
    default: {
      return;
    }
  }
}
