import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import { Text, View } from 'react-native';
import SimplePage from '../components/SimplePage';
import { useCloud } from '../cloud-core/KiteReact';
import Row from '../components/Row';
import Tag from '../components/Tag';
import Button from '../components/Button';
import useAsyncError from '../react-utils/useAsyncError';
import useFocus from '../navigation-hooks/useFocus';
import { titleStyle, primaryFontFace } from '../components/Styles';
import useTimeSeconds from '../utils/useTimeSeconds';
import StatusBar from '../components/StatusBar';
import RowSection from '../components/RowSection';
import BlockFormInput from '../components/BlockFormInput';
import SpinnerButton from '../components/SpinnerButton';
import AsyncButton from '../components/AsyncButton';
import { useDeviceId, isStateLoaded } from '../components/useAsyncStorage';
import ButtonStack from '../components/ButtonStack';
import MultiSelect from '../components/MultiSelect';
import TemperatureView from '../components/TemperatureView';
import { useKitchenState } from '../ono-cloud/OnoKitchen';
import KitchenCommands from '../logic/KitchenCommands';
import { useIsRestaurantOpen, useRestaurantState } from '../ono-cloud/Kitchen';
import useKeyboardPopover from '../components/useKeyboardPopover';
import KitchenCommandButton from '../components/KitchenCommandButton';

function PopoverTitle({ children }) {
  return (
    <Text
      style={{
        ...titleStyle,
        textAlign: 'center',
        margin: 8,
        fontSize: 28,
      }}
    >
      {children}
    </Text>
  );
}

function CloseRestaurantButtons({ onClose }) {
  const [restaurantState, dispatch] = useRestaurantState();

  return (
    <View style={{ padding: 10 }}>
      <PopoverTitle>close restaurant..</PopoverTitle>
      <ButtonStack
        buttons={[
          <Button
            title="gracefully, in 10 minutes"
            onPress={() => {
              dispatch({
                type: 'ScheduleRestaurantClose',
                scheduledCloseTime: Date.now() + 1000 * 60 * 10,
              });
              onClose();
            }}
          />,
          <Button
            title="now. leave orders queued"
            onPress={() => {
              dispatch({
                type: 'CloseRestaurant',
                immediate: false,
              });
              onClose();
            }}
          />,
          <Button
            title="immediately. cancel queued orders"
            onPress={() => {
              dispatch({
                type: 'CloseRestaurant',
                immediate: true,
              });
              onClose();
            }}
          />,
        ]}
      />
    </View>
  );
}

function SafetyView() {
  const kitchenState = useKitchenState();
  if (!kitchenState) {
    return null;
  }
  const bypassKey = kitchenState.System_SafetyBypassKey_READ;
  return (
    <Row title="Safety">
      {bypassKey ? (
        <Tag title="SAFETY BYPASSED" color={Tag.negativeColor} />
      ) : (
        <Tag title="Safety Enabled" color={Tag.positiveColor} />
      )}
    </Row>
  );
}

function VanView() {
  const cloud = useCloud();
  const kitchenState = useKitchenState();
  const handleError = useAsyncError();
  if (!kitchenState) {
    return null;
  }
  const lockSkid = kitchenState.System_LockSkid_VALUE;
  const isSkidLocked = kitchenState.System_SkidLocked_READ;
  const skidIn = kitchenState.System_SkidPositionSensors_READ;
  const isVanPluggedIn = kitchenState.System_VanPluggedIn_READ;
  const vanPowerEnable = kitchenState.System_VanPowerEnable_VALUE;
  return (
    <Row title="Van System Power">
      {/* {isSkidLocked ? (
        <Tag title="Machine Locked" color={Tag.positiveColor} />
      ) : (
        <Tag title="Machine Unlocked" color={Tag.warningColor} />
      )} */}

      {/* <MultiSelect
        value={lockSkid}
        onValue={value => {
          handleError(
            cloud.dispatch({
              type: 'KitchenWriteMachineValues',
              subsystem: 'System',
              pulse: [],
              values: {
                LockSkid: value,
              },
            }),
          );
        }}
        options={[
          { value: true, name: 'Lock Skid' },
          { value: false, name: 'Unlock Skid' },
        ]}
      /> */}
      <MultiSelect
        value={vanPowerEnable}
        onValue={value => {
          handleError(
            cloud.dispatch({
              type: 'KitchenWriteMachineValues',
              subsystem: 'System',
              pulse: [],
              values: {
                VanPowerEnable: value,
              },
            }),
          );
        }}
        options={[
          { value: true, name: 'Enable Van Power' },
          { value: false, name: 'Disable Van Power' },
        ]}
      />
    </Row>
  );
}

function ServicingView() {
  const kitchenState = useKitchenState();
  if (!kitchenState) {
    return null;
  }
  const isHomed = kitchenState.FillSystem_Homed_READ;
  const isInServiceMode = kitchenState.FillSystem_InServiceMode_READ;
  return (
    <Row title="Service Mode - For end-of-day shutdown">
      <View>
        {isInServiceMode ? (
          <Tag
            title={`Service Mode (${isHomed ? 'homed' : 'not homed'})`}
            color={Tag.warningColor}
          />
        ) : isHomed ? (
          <Tag title="Active Mode, Homed" color={Tag.positiveColor} />
        ) : (
          <Tag title="Not Homed" color={Tag.negativeColor} />
        )}
      </View>
      <ButtonStack
        buttons={[
          kitchenState.FillSystem_InServiceMode_READ ? (
            <KitchenCommandButton commandType="Home" title="home system" />
          ) : (
            <KitchenCommandButton
              commandType="EnterServiceMode"
              title="enter service mode"
            />
          ),
        ]}
      />
    </Row>
  );
}

function CleaningView() {
  const [restaurantState, dispatch] = useRestaurantState();
  const deviceId = useDeviceId();
  const kitchenState = useKitchenState();
  if (!kitchenState || !deviceId || !restaurantState) {
    return null;
  }
  const canClear =
    restaurantState.reservedFillGripperClean &&
    restaurantState.reservedFillGripperClean.lockId === deviceId;
  const canReserve = !restaurantState.reservedFillGripperClean;
  return (
    <Row title="Fill Gripper Cleaning">
      <View>
        {restaurantState.reservedFillGripperClean && (
          <Tag
            title="Paused for Fill Positioner Cleaning"
            color={Tag.warningColor}
          />
        )}
      </View>
      <ButtonStack
        buttons={[
          canClear ? (
            <Button
              onPress={() => {
                dispatch({
                  type: 'ClearFillGripperClean',
                  lockId: deviceId,
                });
              }}
              title="Done Cleaning Fill Gripper"
            />
          ) : canReserve ? (
            <Button
              onPress={() => {
                dispatch({
                  type: 'ReserveFillGripperClean',
                  lockId: deviceId,
                });
              }}
              title="Clean Fill Gripper"
            />
          ) : null,
        ]}
      />
    </Row>
  );
}

function BlenderCleaningView() {
  const [restaurantState, dispatch] = useRestaurantState();
  const deviceId = useDeviceId();
  const kitchenState = useKitchenState();
  if (!kitchenState || !deviceId || !restaurantState) {
    return null;
  }
  const canClear =
    restaurantState.reservedBlenderClean &&
    restaurantState.reservedBlenderClean.lockId === deviceId;
  const canReserve = !restaurantState.reservedBlenderClean;
  return (
    <Row title="Blender Cleaning">
      <View>
        {restaurantState.reservedBlenderClean && (
          <Tag title="Paused for Blender Cleaning" color={Tag.warningColor} />
        )}
      </View>
      <ButtonStack
        buttons={[
          canClear ? (
            <Button
              onPress={() => {
                dispatch({
                  type: 'ClearBlenderClean',
                  lockId: deviceId,
                });
              }}
              title="Done Cleaning Blender"
            />
          ) : canReserve ? (
            <Button
              onPress={() => {
                dispatch({
                  type: 'ReserveBlenderClean',
                  lockId: deviceId,
                  mode: null,
                });
              }}
              title="Clean Blender"
            />
          ) : null,
        ]}
      />
      {canClear && (
        <MultiSelect
          value={restaurantState.reservedBlenderClean.mode || null}
          onValue={mode => {
            dispatch({
              type: 'ReserveBlenderClean',
              lockId: deviceId,
              mode,
            });
          }}
          options={[
            { value: null, name: 'Ready' },
            { value: 'lifter', name: 'Lifter Up' },
            { value: 'blender', name: 'Blender Up' },
            { value: 'arm', name: 'Arm Back' },
          ]}
        />
      )}
    </Row>
  );
}

function OpenRestaurantForm({ onClose }) {
  const [_, dispatch] = useRestaurantState();
  const [sessionName, setSessionName] = React.useState('');
  async function handleOpen() {
    await dispatch({
      type: 'OpenRestaurant',
      sessionName,
    });
    onClose();
  }
  const { inputs } = useFocus({
    onSubmit: handleOpen,
    inputRenderers: [
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }} key="qty">
          <BlockFormInput
            {...inputProps}
            label="Session Name"
            onValue={setSessionName}
            value={sessionName}
          />
        </View>
      ),
    ],
  });

  return (
    <View>
      {inputs}
      <View style={{ padding: 10 }}>
        <AsyncButton onPress={handleOpen} title="Open Restaurant" />
      </View>
    </View>
  );
}

function MaintenanceModeForm({ onClose }) {
  const [_, dispatch] = useRestaurantState();
  const [maintenanceReason, setReason] = React.useState('');
  async function handleOpen() {
    await dispatch({
      type: 'SetMaintenanceMode',
      maintenanceMode: true,
      maintenanceReason,
    });
    onClose();
  }
  const { inputs } = useFocus({
    onSubmit: handleOpen,
    inputRenderers: [
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }} key="qty">
          <BlockFormInput
            {...inputProps}
            label="what is wrong"
            onValue={setReason}
            value={maintenanceReason}
          />
        </View>
      ),
    ],
  });

  return (
    <View>
      {inputs}
      <View style={{ padding: 10 }}>
        <AsyncButton onPress={handleOpen} title="Enter Maintenance Mode" />
      </View>
    </View>
  );
}

function useRestaurantOpenPopover() {
  const { onPopover } = useKeyboardPopover(({ onClose }) => {
    return <OpenRestaurantForm onClose={onClose} />;
  });
  return onPopover;
}

function StatusView() {
  const [restaurantState, dispatch] = useRestaurantState();
  const { isOpen, isTraveling, closingSoon } = useIsRestaurantOpen(
    restaurantState,
  );
  const isMaintenanceMode = restaurantState && restaurantState.maintenanceMode;
  const timeSeconds = useTimeSeconds();
  let tagText = 'restaurant open';
  let tagColor = Tag.positiveColor;
  if (closingSoon) {
    const totalSecRemaining = Math.floor(
      closingSoon.scheduledCloseTime / 1000 - timeSeconds,
    );
    const minsRemaining = Math.floor(totalSecRemaining / 60);
    const minSecRemaining = totalSecRemaining % 60;
    tagText = `restaurant closing in \n${minsRemaining}:${String(
      minSecRemaining,
    ).padStart(2, '0')}`;
  }
  if (!isOpen) {
    tagColor = Tag.warningColor;
    tagText = 'restaurant closed';
  }
  if (isTraveling) {
    tagColor = Tag.positiveColor;
    tagText = 'traveling';
  }
  if (isMaintenanceMode) {
    tagColor = Tag.negativeColor;
    tagText = 'Maintenance Mode';
  }
  const { onPopover: onMaintenancePopover } = useKeyboardPopover(
    ({ onClose }) => {
      return <MaintenanceModeForm onClose={onClose} />;
    },
  );
  const { onPopover: onCloseRestaurantPopover } = useKeyboardPopover(
    ({ onClose }) => {
      return <CloseRestaurantButtons onClose={onClose} />;
    },
  );
  const onOpenRestaurantPopover = useRestaurantOpenPopover();

  const buttons = [];
  if (isOpen) {
    buttons.push(
      <Button title="close restaurant" onPress={onCloseRestaurantPopover} />,
    );
    buttons.push(
      <AsyncButton
        title={
          isMaintenanceMode ? 'exit maintenance mode' : 'enter maintenance mode'
        }
        onPress={async () => {
          if (isMaintenanceMode) {
            await dispatch({
              type: 'SetMaintenanceMode',
              maintenanceMode: false,
              maintenanceReason: null,
            });
          } else {
            onMaintenancePopover();
          }
        }}
      />,
    );
  } else if (isTraveling) {
    buttons.push(
      <Button
        title="park restaurant"
        onPress={() => {
          dispatch({
            type: 'ParkRestaurant',
          });
        }}
      />,
    );
  } else {
    buttons.push(
      <Button
        title="travel restaurant"
        onPress={() => {
          dispatch({
            type: 'TravelRestaurant',
          });
        }}
      />,
    );
    buttons.push(
      <Button title="open restaurant" onPress={onOpenRestaurantPopover} />,
    );
  }
  if (closingSoon) {
    buttons.push(
      <Button
        title="clear close schedule"
        type="outline"
        onPress={() => {
          dispatch({
            type: 'ScheduleRestaurantClose',
            scheduledCloseTime: null,
          });
        }}
      />,
    );
  }
  return (
    <Row title="Restaurant Opening">
      <View>
        <Tag title={tagText} color={tagColor} />
        {restaurantState && !!restaurantState.sessionName && (
          <Text style={{ ...primaryFontFace, fontSize: 20 }}>
            {isOpen && restaurantState.sessionName}
          </Text>
        )}
      </View>
      <ButtonStack buttons={buttons} />
    </Row>
  );
}

function TanksView() {
  return (
    <Row title="Tanks">
      <KitchenCommandButton
        commandType="FillWaterTank"
        title="fill tank for 30sec"
      />
    </Row>
  );
}

export default function RestaurantStatusScreen(props) {
  return (
    <SimplePage {...props} hideBackButton footer={<StatusBar />}>
      <RootAuthenticationSection>
        {/* <SafetyView /> */}
        <CleaningView />
        <BlenderCleaningView />
        <ServicingView />
        <StatusView />
        <VanView />
        <TemperatureView />
        <TanksView />
      </RootAuthenticationSection>
    </SimplePage>
  );
}

RestaurantStatusScreen.navigationOptions = SimplePage.navigationOptions;
