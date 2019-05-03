export default function createDispatcher(
  actions,
  fallbackDispatch,
  filterDomain,
) {
  function dispatch(action) {
    if (filterDomain && fallbackDispatch && action.domain !== filterDomain) {
      return fallbackDispatch(action);
    }
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
