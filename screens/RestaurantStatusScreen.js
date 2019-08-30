import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import { Text, View } from 'react-native';
import SimplePage from '../components/SimplePage';
import { useCloud } from '../cloud-core/KiteReact';
import Row from '../components/Row';
import Tag from '../components/Tag';
import Button from '../components/Button';
import useAsyncError from '../react-utils/useAsyncError';
import { Easing } from 'react-native-reanimated';
import useFocus from '../navigation-hooks/useFocus';
import {
  titleStyle,
  proseFontFace,
  monsterra,
  standardTextColor,
} from '../components/Styles';
import KeyboardPopover from '../components/KeyboardPopover';
import { usePopover } from '../views/Popover';
import { useRestaurantState, useIsRestaurantOpen } from '../ono-cloud/Kitchen';
import useTimeSeconds from '../utils/useTimeSeconds';
import RowSection from '../components/RowSection';
import BlockFormInput from '../components/BlockFormInput';
import Subtitle from '../components/Subtitle';
import MultiSelect from '../components/MultiSelect';
import TemperatureView from '../components/TemperatureView';
import { useKitchenState } from '../ono-cloud/OnoKitchen';

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
    <View>
      <PopoverTitle>Close Restaurant..</PopoverTitle>
      <Button
        title="gracefully, in 10 minutes"
        onPress={() => {
          dispatch({
            type: 'ScheduleRestaurantClose',
            scheduledCloseTime: Date.now() + 1000 * 60 * 10,
          });
          onClose();
        }}
      />
      <Button
        title="now. finish queued orders"
        onPress={() => {
          dispatch({
            type: 'CloseRestaurant',
            immediate: false,
          });
          onClose();
        }}
      />
      <Button
        title="immediately. cancel queued orders"
        onPress={() => {
          dispatch({
            type: 'CloseRestaurant',
            immediate: true,
          });
          onClose();
        }}
      />
    </View>
  );
}

function InfoText({ children }) {
  return (
    <Text style={{ ...proseFontFace, color: standardTextColor }}>
      {children}
    </Text>
  );
}

function ButtonStack({ buttons }) {
  return (
    <View>
      {buttons.map((button, buttonIndex) => (
        <View
          style={{ marginBottom: buttonIndex === buttons.length - 1 ? 0 : 12 }}
        >
          {button}
        </View>
      ))}
    </View>
  );
}

function VanView() {
  const [restaurantState] = useRestaurantState();
  const cloud = useCloud();
  const kitchenState = useKitchenState();
  const handleError = useAsyncError();

  if (!kitchenState || !restaurantState) {
    return null;
  }

  // kitchenState.System_LockSkid_VALUE
  const lockSkid = kitchenState.System_LockSkid_VALUE;
  const isSkidLocked = kitchenState.System_SkidLocked_READ;
  const skidIn = kitchenState.System_SkidPositionSensors_READ;
  const isVanPluggedIn = kitchenState.System_VanPluggedIn_READ;
  const isHomed = kitchenState.FillSystem_Homed_READ;
  const isInServiceMode = kitchenState.FillSystem_InServiceMode_READ;
  const readyToEnterServiceMode =
    kitchenState.FillSystem_EnterServiceModeReady_READ;
  const isFillSystemIdle = kitchenState.FillSystem_PrgStep_READ === 0;

  return (
    <Row title="Van / Servicing">
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
      <Button
        title="home system"
        disabled={!isFillSystemIdle}
        onPress={() => {
          handleError(
            cloud.dispatch({
              type: 'KitchenCommand',
              commandType: 'Home',
            }),
          );
        }}
      />
      <Button
        title="enter service mode"
        disabled={!readyToEnterServiceMode}
        onPress={() => {
          handleError(
            cloud.dispatch({
              type: 'KitchenCommand',
              commandType: 'EnterServiceMode',
            }),
          );
        }}
      />
    </Row>
  );
}

function StatusView() {
  const [restaurantState, dispatch] = useRestaurantState();
  const { isOpen, isTraveling, closingSoon } = useIsRestaurantOpen(
    restaurantState,
  );
  const timeSeconds = useTimeSeconds();
  let tagText = 'restaurant open';
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
    tagText = 'restaurant closed';
  }
  if (isTraveling) {
    tagText = 'traveling';
  }

  const { onPopover: onCloseRestaurantPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <CloseRestaurantButtons onClose={onClose} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );
  return (
    <RowSection>
      <Row title="restaurant status">
        <View style={{ flex: 1 }}>
          <Subtitle title={tagText} />
        </View>
        <ButtonStack
          buttons={[
            isOpen ? (
              <Button
                title="close restaurant"
                onPress={onCloseRestaurantPopover}
              />
            ) : isTraveling ? (
              <Button
                title="park restaurant"
                onPress={() => {
                  dispatch({
                    type: 'ParkRestaurant',
                  });
                }}
              />
            ) : (
              <React.Fragment>
                <Button
                  title="travel restaurant"
                  onPress={() => {
                    dispatch({
                      type: 'TravelRestaurant',
                    });
                  }}
                />
                <Button
                  title="open restaurant"
                  onPress={() => {
                    dispatch({
                      type: 'OpenRestaurant',
                    });
                  }}
                />
              </React.Fragment>
            ),
            closingSoon && (
              <Button
                title="clear close schedule"
                type="outline"
                onPress={() => {
                  dispatch({
                    type: 'ScheduleRestaurantClose',
                    scheduledCloseTime: null,
                  });
                }}
              />
            ),
          ]}
        />
      </Row>
    </RowSection>
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

function SetFridgeTemp() {
  const kitchenState = useKitchenState() || {};
  const cloud = useCloud();
  const handleError = useAsyncError();

  const { onPopover: onSetFridgeTemp } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <SetFridgeTempForm
            onClose={onClose}
            onValues={({ low, high }) => {
              handleError(
                cloud.dispatch({
                  type: 'KitchenWriteMachineValues',
                  subsystem: 'System',
                  pulse: [],
                  values: {
                    FreezerLowSetPoint: low,
                    FreezerHighSetPoint: high,
                  },
                }),
              );
            }}
            initialValues={{
              high: kitchenState.System_FreezerHighSetPoint_VALUE,
              low: kitchenState.System_FreezerLowSetPoint_VALUE,
            }}
          />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );
  if (
    kitchenState.System_FreezerHighSetPoint_VALUE == null ||
    kitchenState.System_FreezerLowSetPoint_VALUE == null
  ) {
    return null;
  }
  return (
    <Button
      title={`Set point [${kitchenState.System_FreezerLowSetPoint_VALUE}° - ${
        kitchenState.System_FreezerHighSetPoint_VALUE
      }°]`}
      onPress={onSetFridgeTemp}
    />
  );
}

function FridgeView() {
  const kitchenState = useKitchenState();
  const fridgeEnabled =
    !!kitchenState && !!kitchenState.System_EnableRefrigerationSystem_VALUE;
  const cloud = useCloud();
  const handleError = useAsyncError();
  return (
    <Row title="Main Refridgeration">
      <Tag
        title={fridgeEnabled ? 'Enabled' : 'Disabled'}
        color={fridgeEnabled ? Tag.positiveColor : Tag.negativeColor}
      />
      <MultiSelect
        options={[
          { name: 'Enable', value: true },
          { name: 'Disable', value: false },
        ]}
        value={fridgeEnabled}
        onValue={value => {
          handleError(
            cloud.dispatch({
              type: 'KitchenWriteMachineValues',
              subsystem: 'System',
              pulse: [],
              values: {
                EnableRefrigerationSystem: value,
              },
            }),
          );
        }}
      />
      <SetFridgeTemp />
    </Row>
  );
}

export default function RestaurantStatusScreen(props) {
  return (
    <SimplePage {...props} hideBackButton>
      <RootAuthenticationSection>
        <StatusView />
        <VanView />
        <FridgeView />
        <TemperatureView />

        {/* <AirPressureView />
        <PowerView />
        <SkidView /> */}
      </RootAuthenticationSection>
    </SimplePage>
  );
}

RestaurantStatusScreen.navigationOptions = SimplePage.navigationOptions;
