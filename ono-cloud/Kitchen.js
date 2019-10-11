import { useCloud, useCloudValue } from '../cloud-core/KiteReact';
import useTimeSeconds from '../utils/useTimeSeconds';

export function useRestaurantState() {
  const cloud = useCloud();
  const dispatch = cloud.docs.get('RestaurantActions2').putTransactionValue;
  const restaurantState = useCloudValue('RestaurantState');
  return [restaurantState, dispatch];
}

export function useIsRestaurantOpen(state) {
  const timeSeconds = useTimeSeconds();
  const isPastClosed =
    !!state &&
    state.scheduledCloseTime &&
    state.scheduledCloseTime / 1000 < timeSeconds;
  if (!state || state.isClosed) {
    return {
      isOpen: false,
      closingSoon: null,
      isTraveling: (state && state.isTraveling) || false,
    };
  }
  const { scheduledCloseTime } = state;
  if (isPastClosed) {
    return { isOpen: false, closingSoon: null, isTraveling: false };
  }
  if (scheduledCloseTime) {
    return {
      isOpen: true,
      closingSoon: { scheduledCloseTime },
      isTraveling: false,
    };
  }
  return { isOpen: true, closingSoon: null, isTraveling: false };
}
