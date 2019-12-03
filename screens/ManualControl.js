import React from 'react';
import KitchenCommandButton from '../components/KitchenCommandButton';
import { useCloudValue } from '../cloud-core/KiteReact';
import RowSection from '../components/RowSection';

export default function ManualControl() {
  const kitchenState = useCloudValue('KitchenState');
  if (!kitchenState) {
    return null;
  }
  return (
    <RowSection title="manual actions" style={{ marginTop: 42 }}>
      <KitchenCommandButton commandType="Home" title="home system" />
      <KitchenCommandButton
        commandType="FillGoToCup"
        title="position under new cup"
      />
      <KitchenCommandButton
        title="position blender handoff"
        commandType="FillGoToHandoff"
      />
      <KitchenCommandButton title="grab new cup" commandType="GetCup" />
      <KitchenCommandButton
        title="drop cup (from fill system)"
        commandType="DropCup"
      />
      <KitchenCommandButton
        title="drop cup (from delivery system)"
        commandType="DeliveryDropCup"
      />
      <KitchenCommandButton
        title="ditch cup (from fill system)"
        commandType="DitchCup"
      />
      <KitchenCommandButton
        title="pass to blender"
        commandType="PassToBlender"
      />
      <KitchenCommandButton title="blend" commandType="Blend" />
      <KitchenCommandButton
        title="pass to delivery"
        commandType="PassToDeliveryWithoutClean"
      />
      <KitchenCommandButton title="dispense cup" commandType="DispenseCup" />
      <KitchenCommandButton title="clean" commandType="Clean" />
      <KitchenCommandButton title="deliver 0" commandType="DeliverBay0" />
      <KitchenCommandButton title="deliver 1" commandType="DeliverBay1" />
    </RowSection>
  );
}
