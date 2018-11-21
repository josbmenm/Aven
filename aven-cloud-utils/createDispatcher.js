export default function createDispatcher(actions, fallbackDispatch) {
  function dispatch(action) {
    if (actions[action.type]) {
      return actions[action.type](action);
    }
    if (fallbackDispatch) {
      return fallbackDispatch(action);
    }
    throw new Error(`Cannot find action "${action.type}"`);
  }
  return dispatch;
}
