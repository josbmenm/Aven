import RestaurantReducer from '../RestaurantReducer';

test('Enables/Disables autorun', () => {
  const state0 = RestaurantReducer(undefined, {});
  expect(!!state0.isAutoRunning).toBe(false);
  const state1 = RestaurantReducer(state0, { type: 'StartAutorun' });
  expect(!!state1.isAutoRunning).toBe(true);
  const state2 = RestaurantReducer(state1, { type: 'PauseAutorun' });
  expect(!!state2.isAutoRunning).toBe(false);
});
