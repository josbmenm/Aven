import { useCloudValue } from '../cloud-core/KiteReact';

export function useRestaurantConfig() {
  const config = useCloudValue('RestaurantConfig');
  return config;
  // return {
  //   mode:
  // }
}
