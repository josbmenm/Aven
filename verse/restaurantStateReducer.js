function arrayLike(thing) {
  if (thing == null) {
    return [];
  }
  if (Array.isArray(thing)) {
    return thing;
  }
  return [thing];
}

function handlePlaceOrder(state, action) {
  return {
    prepQueue: [...action.prepQueue, ...arrayLike(state.prepQueue)],
    ...state,
  };
}

export default function restaurantStateReducer(state = {}, action) {
  switch (action.type) {
    case 'PlaceOrder':
      return handlePlaceOrder(state, action);
  }
  return state;
}
