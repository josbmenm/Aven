import OnoRestaurantContext from './OnoRestaurantContext';
import useRefValue from '../aven-cloud/useRefValue';

import { useContext } from 'react';

export function useKitchen() {
  const restaurant = useContext(OnoRestaurantContext);
  const kitchenState = useRefValue(restaurant.getRef('KitchenState'));
  const kitchenConfig = useRefValue(restaurant.getRef('KitchenConfig'));
  async function kitchenCommand(subsystemName, pulse, values) {
    await restaurant.dispatch({
      type: 'KitchenCommand',
      subsystem: subsystemName,
      pulse,
      values,
    });
  }
  return { kitchenState, kitchenConfig, kitchenCommand };
}
