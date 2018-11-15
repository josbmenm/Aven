export default function createDispatcher(actions) {
  function dispatch(action) {
    if (actions[action.type]) {
      return actions[action.type](action);
    }
    throw new Error(`Cannot find action "${action.type}"`);
  }
  return dispatch;
}
