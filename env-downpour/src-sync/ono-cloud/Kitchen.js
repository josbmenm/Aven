import {
  useCloud,
  useCloudReducer,
  useCloudValue,
} from '../cloud-core/KiteReact';
import React from 'react';
import useTimeSeconds from '../utils/useTimeSeconds';

export function useRestaurantState() {
  // const [restaurantState, dispatch] = useCloudReducer(
  //   'RestaurantActions',
  //   RestaurantReducer,
  // );
  const cloud = useCloud();
  const dispatch = cloud.docs.get('RestaurantActions').putTransactionValue;
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
    return { isOpen: false, closingSoon: null };
  }
  const { scheduledCloseTime } = state;
  if (isPastClosed) {
    return { isOpen: false, closingSoon: null };
  }
  if (scheduledCloseTime) {
    return { isOpen: true, closingSoon: { scheduledCloseTime } };
  }
  return { isOpen: true, closingSoon: null };
}
