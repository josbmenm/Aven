import DataClient from '../aven-data-client/DataClient';

import withObservables from '@nozbe/with-observables';
import mapObject from 'fbjs/lib/mapObject';

const IS_DEV = process.env.NODE_ENV !== 'production';

const DEV_HOST = {
  useSSL: false,
  authority: 'localhost:8830',
};
const PROD_HOST = {
  useSSL: false,
  authority: 'ono-maui-restaurant',
};

const HOST = DEV_HOST;
// const HOST = PROD_HOST;
// const HOST = IS_DEV ? DEV_HOST : PROD_HOST;

export const Client = new DataClient({
  host: HOST,
  domain: 'kitchen.maui.onofood.co',
});

export const kitchenState = Client.getRef('KitchenState');

export const kitchenConfig = Client.getRef('KitchenConfig');

export const withKitchen = withObservables([], () => ({
  kitchenState: kitchenState.observeObjectValue,
  kitchenConfig: kitchenConfig.observeObjectValue,
}));

export const dispatchKitchenCommand = async (subsystemName, pulse, values) => {
  await Client.dispatch({
    type: 'kitchenCommand',
    subsystem: subsystemName,
    pulse,
    values,
  });
};

export const getSubsystem = (subsystemName, kitchenConfig, kitchenState) => {
  const ss = kitchenConfig.subsystems[subsystemName];
  if (!ss) {
    return null;
  }
  const reads = mapObject(ss.readTags, (tag, tagName) => {
    const internalTagName = `${subsystemName}_${tagName}_READ`;
    const value = kitchenState[internalTagName];
    const read = { ...tag, value, name: tagName };
    console.log(read);
    return read;
  });
  const noFaults = reads.NoFaults ? reads.NoFaults.value : null;
  return {
    icon: ss.icon,
    valueCommands: ss.valueCommands,
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

export const dispatch = Client.dispatch;
