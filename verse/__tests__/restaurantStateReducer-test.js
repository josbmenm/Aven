import restaurantStateReducer from '../restaurantStateReducer';

test('places orders', () => {
  const prevState = {};
  const action = {
    type: 'QueueOrderItem',
    prepQueue: [{ key: 'foo' }],
  };
  const state = restaurantStateReducer(prevState, action);
  expect(state.prepQueue.length).toBe(1);
});
