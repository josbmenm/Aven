import {
  useCloud,
  useCloudReducer,
  useCloudValue,
} from '../cloud-core/KiteReact';

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
