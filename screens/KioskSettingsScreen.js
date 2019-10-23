import React from 'react';
import { View } from 'react-native';
import SimplePage from '../components/SimplePage';
import RowSection from '../components/RowSection';
import LinkRow from '../components/LinkRow';
import Button from '../components/Button';
import AppInfoText from '../components/AppInfoText';
import { useCloud } from '../cloud-core/KiteReact';
import codePush from 'react-native-code-push';
import { useKitchenState } from '../ono-cloud/OnoKitchen';
import Row from '../components/Row';
import Tag from '../components/Tag';
import useAsyncError from '../react-utils/useAsyncError';
import MultiSelect from '../components/MultiSelect';
import { useRestaurantConfig } from '../logic/RestaurantConfig';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import useKeyboardPopover from '../components/useKeyboardPopover';

function FridgeView() {
  const kitchenState = useKitchenState();
  const fridgeEnabled =
    !!kitchenState && !!kitchenState.System_EnableRefrigerationSystem_VALUE;
  const cloud = useCloud();
  const handleError = useAsyncError();
  return (
    <Row title="main refridgeration">
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

function CompressorView() {
  const kitchenState = useKitchenState();
  const fridgeEnabled =
    !!kitchenState && !!kitchenState.System_EnableAirSystem_VALUE;
  const cloud = useCloud();
  const handleError = useAsyncError();
  return (
    <Row title="air compressor">
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
                EnableAirSystem: value,
              },
            }),
          );
        }}
      />
    </Row>
  );
}

function UpdateAirtableRow() {
  const cloud = useCloud();
  return (
    <LinkRow
      onPress={() => {
        cloud
          .dispatch({ type: 'UpdateAirtable' })
          .then(() => {
            alert('Airtable Update Started. Usually takes ~2 minutes..');
          })
          .catch(e => {
            console.error(e);
            alert('Error updating Airtable!');
          });
      }}
      icon="♻️"
      title="Update Airtable"
    />
  );
}

function CateringMode() {
  const restaurantConfig = useRestaurantConfig();
  const isCateringMode =
    !!restaurantConfig && restaurantConfig.mode === 'catering';
  const cloud = useCloud();
  const handleError = useAsyncError();
  return (
    <Row title="catering mode">
      <Tag
        title={isCateringMode ? 'Free Blends' : 'Regular Mode'}
        color={isCateringMode ? Tag.warningColor : Tag.positiveColor}
      />
      <MultiSelect
        options={[
          { name: 'Catering', value: true },
          { name: 'Regular', value: false },
        ]}
        value={isCateringMode}
        onValue={value => {
          handleError(
            cloud.get('RestaurantConfig').transact(config => ({
              ...config,
              mode: value ? 'catering' : 'regular',
            })),
          );
        }}
      />
    </Row>
  );
}

function AlarmFakeButtons() {
  const [state, dispatch] = useRestaurantState();

  return (
    <React.Fragment>
      <Button
        title="Temp"
        onPress={() => {
          dispatch({
            type: 'SetAlarm',
            alarmType: 'FreezerTemp',
          });
        }}
      />
    </React.Fragment>
  );
}

function AlarmMode() {
  const [state, dispatch] = useRestaurantState();
  const isMuteAlarms = !!state && !!state.isMutingAlarms;
  const handleError = useAsyncError();
  return (
    <Row title="disable restaurant alarms">
      <Tag
        title={isMuteAlarms ? 'Alarms Disabled' : 'Alarms Enabled'}
        color={isMuteAlarms ? Tag.warningColor : Tag.positiveColor}
      />
      <MultiSelect
        options={[
          { name: 'Disable', value: true },
          { name: 'Regular Operation', value: false },
        ]}
        value={isMuteAlarms}
        onValue={value => {
          handleError(
            dispatch({
              type: 'SetAlarmMute',
              isMutingAlarms: value,
            }),
          );
        }}
      />
      {isMuteAlarms && false && <AlarmFakeButtons />}
    </Row>
  );
}

function SetFridgeTemp() {
  const kitchenState = useKitchenState() || {};
  const cloud = useCloud();
  const handleError = useAsyncError();

  const { onPopover: onSetFridgeTemp } = useKeyboardPopover(({ onClose }) => {
    return (
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
    );
  });
  if (
    kitchenState.System_FreezerHighSetPoint_VALUE == null ||
    kitchenState.System_FreezerLowSetPoint_VALUE == null
  ) {
    return null;
  }
  return (
    <Button
      title={`Set point [${kitchenState.System_FreezerLowSetPoint_VALUE}° - ${kitchenState.System_FreezerHighSetPoint_VALUE}°]`}
      onPress={onSetFridgeTemp}
    />
  );
}

function DryRunMode() {
  const [restaurantState, dispatch] = useRestaurantState();
  const handleError = useAsyncError();
  const dryMode = (restaurantState && restaurantState.isDryRunning) || false;
  const isFillEnabled = !dryMode;
  const isBlendEnabled = dryMode !== true;
  return (
    <React.Fragment>
      <Row title="dry run machine">
        <Tag
          title={isFillEnabled ? 'Filling Enabled' : 'Filling Disabled'}
          color={isFillEnabled ? Tag.positiveColor : Tag.negativeColor}
        />
        <Tag
          title={isBlendEnabled ? 'Blending Enabled' : 'Blending Disabled'}
          color={isBlendEnabled ? Tag.positiveColor : Tag.negativeColor}
        />
      </Row>
      <View style={{ alignSelf: 'center' }}>
        <MultiSelect
          options={[
            { name: 'Dry run', value: true },
            { name: 'Dry with blend and rinse', value: 'withBlend' },
            { name: 'Regular fills and blend', value: false },
          ]}
          value={dryMode}
          onValue={value => {
            handleError(
              dispatch({
                type: 'SetDryMode',
                isDryRunning: value,
              }),
            );
          }}
        />
      </View>
    </React.Fragment>
  );
}

function ClearMapButton() {
  const [_, dispatch] = useRestaurantState();
  return (
    <Row title="clear material map">
      <Button
        title="Clear"
        onPress={() => {
          dispatch({
            type: 'WipeState',
          });
        }}
      />
    </Row>
  );
}

export default function KioskSettingsScreen({ navigation, ...props }) {
  return (
    <SimplePage {...props} navigation={navigation} hideBackButton>
      <CateringMode />
      <AlarmMode />
      <DryRunMode />

      <FridgeView />
      <CompressorView />
      <ClearMapButton />
      <RowSection>
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'Sequencer' });
          }}
          icon="⚙️"
          title="Technician Control"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'FeedbackApp' });
          }}
          icon="💬"
          title="Feedback App"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'DeviceManager' });
          }}
          icon="📱"
          title="Restaurant Devices"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'ComponentPlayground' });
          }}
          icon="🧱"
          title="Component Playground"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'PaymentDebug' });
          }}
          icon="💸"
          title="Card Reader Connection"
        />
        <LinkRow
          onPress={() => {
            throw new Error('User-forced error!');
          }}
          icon="⚠️"
          title="Test App Error"
        />
        <LinkRow
          onPress={() => {
            console.error('User-forced soft error!');
          }}
          icon="⚠️"
          title="Test Soft Error"
        />
        <LinkRow
          onPress={() => {
            codePush.restartApp();
          }}
          icon="♻️"
          title="Refresh App"
        />

        <UpdateAirtableRow />
      </RowSection>
      <AppInfoText />
    </SimplePage>
  );
}

KioskSettingsScreen.navigationOptions = SimplePage.navigationOptions;
