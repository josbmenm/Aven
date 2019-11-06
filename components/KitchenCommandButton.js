import React from 'react';
import { useCloud } from '../cloud-core/KiteReact';
import AsyncButton from '../components/AsyncButton';
import { useKitchenState } from '../ono-cloud/OnoKitchen';
import KitchenCommands from '../logic/KitchenCommands';

export default function KitchenCommandButton({ commandType, params, title }) {
  let isDisabled = true;
  const cloud = useCloud();
  const kitchenState = useKitchenState();

  if (kitchenState) {
    const command = KitchenCommands[commandType];
    const isReady = command.checkReady(kitchenState);
    if (isReady) isDisabled = false;
  }

  async function handlePress() {
    await cloud.dispatch({
      type: 'KitchenCommand',
      commandType,
      params,
    });
  }

  return (
    <AsyncButton onPress={handlePress} disabled={isDisabled} title={title} />
  );
}
