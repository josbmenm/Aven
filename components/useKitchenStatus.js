import { useCloud, useCloudValue, useValue } from '../cloud-core/KiteReact';
import { getSubsystem, getSubsystemFaults } from '../ono-cloud/OnoKitchen';

export default function useKitchenStatus(restaurantState) {
  const cloud = useCloud();
  const isConnected = useValue(cloud.connected); // uh....
  const kitchenState = useCloudValue('KitchenState');
  const kitchenConfig = useCloudValue('KitchenConfig');

  const isPLCConnected = !!kitchenState && kitchenState.isPLCConnected;
  const sequencerNames =
    kitchenConfig &&
    Object.keys(kitchenConfig.subsystems)
      .map(k => kitchenConfig.subsystems[k])
      .filter(subsystem => subsystem.hasSequencer)
      .map(s => s.name);
  let status = 'ready';
  let message = 'Ready and Idle';
  let isRunning = false;
  let mainFaultMessage = null;
  let allFaults = [];
  if (!isConnected) {
    status = 'disconnected';
    message = 'App disconnected from restaurant.';
  } else if (restaurantState === undefined) {
    status = 'disconnected';
    message = 'Loading state..';
  } else if (!isPLCConnected) {
    status = 'disconnected';
    message = 'Server disconnected from machine.';
  } else {
    if (!kitchenState) {
      status = 'disconnected';
      message = restaurantState.isAttached
        ? 'Disconnected Sequencer'
        : 'Machine Disconnected';
    }
    if (!restaurantState.isAttached) {
      status = 'fault';
      message = 'Sequencer Disabled';
    } else if (!restaurantState.isAutoRunning) {
      status = 'paused';
      message = 'Paused';
    }
    if (kitchenState) {
      sequencerNames &&
        sequencerNames.forEach(systemName => {
          const system = getSubsystem(systemName, kitchenConfig, kitchenState);
          const faults = getSubsystemFaults(system);
          if (faults) {
            if (systemName === 'FillSystem') {
              mainFaultMessage = faults.join(', ');
            }
            allFaults = [
              ...allFaults,
              ...faults.map(description => ({
                description,
                isFaulted: description !== 'Not Homed',
                systemName,
              })),
            ];
          }
        });
      const hasActuallyFaulted = allFaults.find(f => f.isFaulted);
      if (allFaults.length) {
        status = 'fault';
        if (hasActuallyFaulted) {
          message = 'Faulted';
          if (mainFaultMessage) {
            message += ` - ${mainFaultMessage}`;
          }
        } else {
          message = 'Not Homed';
        }
      }
    }
  }
  if (status !== 'disconnected') {
    sequencerNames &&
      sequencerNames.forEach(systemName => {
        if (kitchenState[`${systemName}_PrgStep_READ`] !== 0) {
          if (!isRunning) {
            isRunning = true;
            message = `Running ${systemName}(${
              kitchenState[`${systemName}_PrgStep_READ`]
            })`;
          } else {
            message += `, ${systemName}(${
              kitchenState[`${systemName}_PrgStep_READ`]
            })`;
          }
        }
      });
  }

  return {
    isPLCConnected,
    status,
    message,
    isRunning,
    allFaults,
    mainFaultMessage,
    kitchenState,
    kitchenConfig,
    restaurantState,
  };
}
