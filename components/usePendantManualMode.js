import { useCloudValue } from '../cloud-core/KiteReact';
import { isStateLoaded, useDeviceId } from '../components/useAsyncStorage';

export default function usePendantManualMode() {
  const kitchenState = useCloudValue('KitchenState');
  const restaurantState = useCloudValue('RestaurantState');
  const deviceId = useDeviceId();
  if (!isStateLoaded(deviceId)) {
    return false;
  }
  if (!kitchenState) {
    return false;
  }
  if (restaurantState && restaurantState.manualMode === deviceId) {
    return true;
  }
  return false;
}
