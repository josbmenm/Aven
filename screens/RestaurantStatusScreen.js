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
import { titleStyle } from '../components/Styles';
import useTimeSeconds from '../utils/useTimeSeconds';
import RowSection from '../components/RowSection';
import BlockFormInput from '../components/BlockFormInput';
import SpinnerButton from '../components/SpinnerButton';
import ButtonStack from '../components/ButtonStack';
import MultiSelect from '../components/MultiSelect';
import TemperatureView from '../components/TemperatureView';
import { useKitchenState } from '../ono-cloud/OnoKitchen';
import KitchenCommands from '../logic/KitchenCommands';
import { useIsRestaurantOpen, useRestaurantState } from '../ono-cloud/Kitchen';
import useKeyboardPopover from '../components/useKeyboardPopover';

function KitchenCommandButton({ commandType, params, title }) {
  const [isLoading, setIsLoading] = React.useState(false);
  let isDisabled = true;
  const cloud = useCloud();
  const kitchenState = useKitchenState();
  const handleError = useAsyncError();

  if (kitchenState) {
    const command = KitchenCommands[commandType];
    const isReady = command.checkReady(kitchenState);
    if (isReady) isDisabled = false;
  }
  function handlePress() {
    setIsLoading(true);
    handleError(
      cloud
        .dispatch({
          type: 'KitchenCommand',
          commandType,
        })
        .finally(() => {
          setIsLoading(false);
        }),
    );
  }

  return (
    <SpinnerButton
      command="Home"
      onPress={handlePress}
      isLoading={isLoading}
      disabled={isDisabled}
      title={title}
    />
  );
}

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
    <Row title="safety">
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
    <Row title="machine in van / servicing">
      {isVanPluggedIn ? (
        <Tag title="Van plugged in" color={Tag.positiveColor} />
      ) : (
        <Tag title="Van not plugged in" color={Tag.warningColor} />
      )}
      {skidIn ? (
        <Tag title="Machine in Van" color={Tag.positiveColor} />
      ) : (
        <Tag title="Machine out of Van" color={Tag.warningColor} />
      )}
      {isSkidLocked ? (
        <Tag title="Machine Locked" color={Tag.positiveColor} />
      ) : (
        <Tag title="Machine Unlocked" color={Tag.warningColor} />
      )}

      <MultiSelect
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
      />
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
    <Row title="service mode">
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
          <KitchenCommandButton commandType="Home" title="home system" />,
          <KitchenCommandButton
            commandType="EnterServiceMode"
            title="enter service mode"
          />,
        ]}
      />
    </Row>
  );
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

  const { onPopover: onCloseRestaurantPopover } = useKeyboardPopover(
    ({ onClose }) => {
      return <CloseRestaurantButtons onClose={onClose} />;
    },
  );

  const buttons = [];
  if (isOpen) {
    buttons.push(
      <Button title="close restaurant" onPress={onCloseRestaurantPopover} />,
    );
    buttons.push(
      <Button
        title={
          isMaintenanceMode ? 'exit maintenance mode' : 'enter maintenance mode'
        }
        onPress={() => {
          dispatch({
            type: 'SetMaintenanceMode',
            maintenanceMode: !isMaintenanceMode,
          });
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
      <Button
        title="open restaurant"
        onPress={() => {
          dispatch({
            type: 'OpenRestaurant',
          });
        }}
      />,
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
    <Row title="restaurant opening">
      <View>
        <Tag title={tagText} color={tagColor} />
      </View>
      <ButtonStack buttons={buttons} />
    </Row>
  );
}

function AirPressureView() {
  return (
    <RowSection title="Air Pressure">
      <Tag title="Pressurized" color={Tag.positiveColor} />
      <Button title="Disable and Depressureize" onPress={() => {}} />
      <Button title="Enable" disabled onPress={() => {}} />
    </RowSection>
  );
}

function PowerView() {
  return (
    <RowSection title="Generator Power">
      <Tag title="Disabled" color={Tag.negativeColor} />
      <Button title="Enable" onPress={() => {}} />
    </RowSection>
  );
}

function SetFridgeTempForm({ onClose, onValues, initialValues }) {
  const [low, setLow] = React.useState(String(initialValues.low));
  const [high, setHigh] = React.useState(String(initialValues.high));

  function handleSubmit() {
    onClose();
    onValues({ low, high });
  }
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }} key="qty">
          <BlockFormInput
            {...inputProps}
            label="Fridge Temp Low"
            onValue={setLow}
            value={low}
          />
        </View>
      ),
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }} key="qty">
          <BlockFormInput
            {...inputProps}
            label="Fridge Temp High"
            onValue={setHigh}
            value={high}
          />
        </View>
      ),
    ],
  });

  return (
    <View>
      {inputs}
      <Button onPress={handleSubmit} title="Save" />
    </View>
  );
}

function TanksView() {
  const kitchenState = useKitchenState();
  let waterTagColor = Tag.positiveColor;
  let waterTagTitle = 'Water: Not Full or Low';

  if (kitchenState && kitchenState.System_FreshWaterFull_READ) {
    waterTagColor = Tag.positiveColor;
    waterTagTitle = 'Water: Filled';
  }
  if (kitchenState && !kitchenState.System_FreshWaterAboveLow_READ) {
    waterTagColor = Tag.negativeColor;
    waterTagTitle = 'Water: Low';
  }
  let wasteTagColor = Tag.positiveColor;
  let wasteTagTitle = 'Waste: Not Full';
  if (kitchenState && kitchenState.System_WasteWaterFull_READ) {
    wasteTagColor = Tag.negativeColor;
    wasteTagTitle = 'Waste: Full';
  }
  return (
    <Row title="tanks">
      <Tag title={waterTagTitle} color={waterTagColor} />
      <Tag title={wasteTagTitle} color={wasteTagColor} />
    </Row>
  );
}

export default function RestaurantStatusScreen(props) {
  return (
    <SimplePage {...props} hideBackButton>
      <RootAuthenticationSection>
        <SafetyView />
        <ServicingView />
        <StatusView />
        <VanView />
        <TanksView />
        <TemperatureView />
      </RootAuthenticationSection>
    </SimplePage>
  );
}

RestaurantStatusScreen.navigationOptions = SimplePage.navigationOptions;
