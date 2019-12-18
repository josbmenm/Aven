import React from 'react';
import KitchenCommandButton from '../components/KitchenCommandButton';
import RowSection from '../components/RowSection';
import ButtonStack from '../components/ButtonStack';
import usePendantManualMode from '../components/usePendantManualMode';
import Row from '../components/Row';

export default function ManualControl() {
  const isManualMode = usePendantManualMode();
  if (!isManualMode) {
    return null;
  }
  return (
    <RowSection title="manual actions" style={{ marginTop: 42 }}>
      <Row title="Fill System">
        <ButtonStack
          buttons={[
            <KitchenCommandButton
              commandType="FillGoToCup"
              title="position: new cup"
            />,
            <KitchenCommandButton
              title="position: blender handoff"
              commandType="FillGoToHandoff"
            />,
          ]}
        />
        <ButtonStack
          buttons={[
            <KitchenCommandButton title="get cup" commandType="GetCup" />,
            <KitchenCommandButton
              title="dispense cup"
              commandType="DispenseCup"
            />,
            <KitchenCommandButton title="drop cup" commandType="DropCup" />,

            <KitchenCommandButton
              title="drop in trash"
              commandType="DitchCup"
            />,
          ]}
        />
      </Row>
      <Row title="Blender">
        <ButtonStack
          buttons={[
            <KitchenCommandButton
              title="pass to blender"
              commandType="PassToBlender"
            />,
            <KitchenCommandButton title="blend" commandType="Blend" />,
            <KitchenCommandButton title="clean" commandType="Clean" />,
          ]}
        />
        <ButtonStack
          buttons={[
            <KitchenCommandButton commandType="LowerBlenderElevator" />,
            <KitchenCommandButton commandType="LiftBlenderElevator" />,
            <KitchenCommandButton commandType="FlipCupPlate" />,
            <KitchenCommandButton commandType="ReturnCupPlate" />,
            <KitchenCommandButton commandType="FlipBlade" />,
            <KitchenCommandButton commandType="ReturnBlade" />,
          ]}
        />
      </Row>
      <Row title="Delivery">
        <ButtonStack
          buttons={[
            <KitchenCommandButton
              title="pass to delivery"
              commandType="PassToDeliveryWithoutClean"
            />,

            <KitchenCommandButton
              title="deliver 0"
              commandType="DeliverBay0"
            />,
            <KitchenCommandButton
              title="deliver 1"
              commandType="DeliverBay1"
            />,
          ]}
        />
        <ButtonStack
          buttons={[
            <KitchenCommandButton
              title="drop cup"
              commandType="DeliveryDropCup"
            />,
            <KitchenCommandButton commandType="RetractArm" />,
            <KitchenCommandButton commandType="ExtendArm" />,
          ]}
        />
      </Row>
    </RowSection>
  );
}
