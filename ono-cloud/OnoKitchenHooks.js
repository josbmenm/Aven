import useCloud from '../aven-cloud/useCloud';
import useRefValue from '../aven-cloud/useRefValue';

export function useKitchen() {
  const restaurant = useCloud();
  const kitchenState = useRefValue(restaurant.get('KitchenState'));
  const kitchenConfig = useRefValue(restaurant.get('KitchenConfig'));
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
