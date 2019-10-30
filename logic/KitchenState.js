export function getCupsInventoryState(kitchenState) {
  let isEmpty = false;
  let isErrored = !kitchenState.Denester_NoFaults_READ;
  let estimatedRemaining = '20+';
  if (kitchenState.Denester_DispensedSinceLow_READ) {
    estimatedRemaining = 20 - kitchenState.Denester_DispensedSinceLow_READ;
    isEmpty = estimatedRemaining <= 0;
  }
  return {
    estimatedRemaining,
    isEmpty,
    isErrored,
  };
}
