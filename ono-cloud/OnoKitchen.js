import OnoRestaurantContext from './OnoRestaurantContext';
import mapObject from 'fbjs/lib/mapObject';
import React from 'react';
import withObservables from '@nozbe/with-observables';

export function withKitchen(Component) {
  const ComponentWithObservedState = withObservables(
    ['kitchenConfig', 'kitchenState'],
    ({ kitchenConfig, kitchenState }) => ({ kitchenConfig, kitchenState }),
  )(Component);

  return props => (
    <OnoRestaurantContext.Consumer>
      {restaurant => (
        <ComponentWithObservedState
          kitchenConfig={restaurant.getRef('KitchenConfig').observeValue}
          kitchenState={restaurant.getRef('KitchenState').observeValue}
          kitchenCommand={async (subsystemName, pulse, values) => {
            await restaurant.dispatch({
              type: 'KitchenCommand',
              subsystem: subsystemName,
              pulse,
              values,
            });
          }}
          {...props}
        />
      )}
    </OnoRestaurantContext.Consumer>
  );
}

export const getSubsystem = (subsystemName, kitchenConfig, kitchenState) => {
  const ss = kitchenConfig.subsystems[subsystemName];
  if (!ss) {
    return null;
  }
  const reads = mapObject(ss.readTags, (tag, tagName) => {
    const internalTagName = `${subsystemName}_${tagName}_READ`;
    const value = kitchenState[internalTagName];
    const read = { ...tag, value, name: tagName };
    return read;
  });
  const valueCommands = mapObject(ss.valueCommands, (command, tagName) => {
    const internalTagName = `${subsystemName}_${tagName}_VALUE`;
    const value = kitchenState[internalTagName];
    const outCmd = { ...command, value, name: tagName };
    return outCmd;
  });
  const noFaults = reads.NoFaults ? reads.NoFaults.value : null;
  return {
    icon: ss.icon,
    valueCommands,
    pulseCommands: ss.pulseCommands,
    name: subsystemName,
    noFaults,
    reads,
  };
};

export const getSubsystemOverview = (kitchenConfig, kitchenState) => {
  return Object.keys(kitchenConfig.subsystems).map(subsystemName => {
    return getSubsystem(subsystemName, kitchenConfig, kitchenState);
  });
};
