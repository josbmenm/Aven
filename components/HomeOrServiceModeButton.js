import React from 'react';
import { useKitchenState } from '../ono-cloud/OnoKitchen';
import KitchenCommandButton from './KitchenCommandButton';

export default function HomeOrServiceModeButton() {
  const kitchenState = useKitchenState();
  if (!kitchenState) {
    return null;
  }
  return kitchenState.FillSystem_InServiceMode_READ ? (
    <KitchenCommandButton commandType="Home" title="home system" />
  ) : (
    <KitchenCommandButton
      commandType="EnterServiceMode"
      title="enter service mode"
    />
  );
}
