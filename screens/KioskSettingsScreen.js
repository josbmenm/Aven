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
import useAsyncErrorPopover from '../components/useAsyncErrorPopover';
import MultiSelect from '../components/MultiSelect';
import BlockFormInput from '../components/BlockFormInput';
import { useRestaurantConfig } from '../logic/RestaurantConfig';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import useKeyboardPopover from '../components/useKeyboardPopover';
import ButtonStack from '../components/ButtonStack';
import useFocus from '../navigation-hooks/useFocus';
import StatusBar from '../components/StatusBar';

function FridgeView() {
  const kitchenState = useKitchenState();
  const fridgeEnabled =
    !!kitchenState && !!kitchenState.System_EnableRefrigerationSystem_VALUE;
  const cloud = useCloud();
  const handleError = useAsyncErrorPopover();
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

function VanInTruckOverride() {
  const kitchenState = useKitchenState();
  const machineInVan =
    !!kitchenState && !!kitchenState.System_MachineInVanBypass_VALUE;
  const cloud = useCloud();
  const handleError = useAsyncErrorPopover();
  return (
    <Row title="override machine in van">
      <Tag
        title={machineInVan ? 'In Van' : 'Out of Van'}
        color={machineInVan ? Tag.positiveColor : Tag.negativeColor}
      />
      <MultiSelect
        options={[
          { name: 'Enable', value: true },
          { name: 'Disable', value: false },
        ]}
        value={machineInVan}
        onValue={value => {
          handleError(
            cloud.dispatch({
              type: 'KitchenWriteMachineValues',
              subsystem: 'System',
              pulse: [],
              values: {
                MachineInVanBypass: value,
              },
            }),
          );
        }}
      />
    </Row>
  );
}

function CompressorView() {
  const kitchenState = useKitchenState();
  const fridgeEnabled =
    !!kitchenState && !!kitchenState.System_EnableAirSystem_VALUE;
  const cloud = useCloud();
  const handleError = useAsyncErrorPopover();
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

function ServerErrorTest() {
  const cloud = useCloud();
  const handleError = useAsyncErrorPopover();
  return (
    <LinkRow
      onPress={() => {
        handleError(
          cloud.dispatch({
            type: 'TestServerError',
          }),
        );
      }}
      onLongPress={() => {
        handleError(
          cloud.dispatch({
            type: 'TestServerCrash',
          }),
        );
      }}
      icon="⚠️"
      title="Test Server Error"
    />
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
  const handleError = useAsyncErrorPopover();
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

const NAMED_FAULTS = {
  bevTemp: 'Beverage Fridge Temperature',
  freezerTemp: 'Freezer Temperature',
  pistonTemp: 'Piston Fridge Temperature',
  wasteFull: 'Waste Tank Full',
  waterEmpty: 'Water Tank Empty',
};
function AlarmMode() {
  const [state, dispatch] = useRestaurantState();
  const handleError = useAsyncErrorPopover();
  return (
    <Row title="disable restaurant faults">
      <View style={{ flex: 1 }}>
        {Object.entries(NAMED_FAULTS).map(([faultName, faultLabel]) => {
          const isMuteAlarms =
            state && state.faultMuting && !!state.faultMuting[faultName];
          return (
            <View
              key={faultName}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Tag
                title={faultLabel}
                color={isMuteAlarms ? Tag.warningColor : Tag.positiveColor}
              />
              <MultiSelect
                options={[
                  { name: 'Disable', value: true },
                  { name: 'Armed', value: false },
                ]}
                value={isMuteAlarms || false}
                onValue={value => {
                  handleError(
                    dispatch({
                      type: 'SetFaultMuting',
                      faultMuting: { [faultName]: value },
                    }),
                  );
                }}
              />
            </View>
          );
        })}
      </View>
    </Row>
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
  const handleError = useAsyncErrorPopover();

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
  const handleError = useAsyncErrorPopover();
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
    <Row title="wipe entire restaurant state (danger)">
      <Button
        title="Wipe State"
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
    <SimplePage
      {...props}
      navigation={navigation}
      hideBackButton
      footer={<StatusBar />}
    >
      <CateringMode />
      <AlarmMode />
      <DryRunMode />

      <FridgeView />
      <VanInTruckOverride />
      <CompressorView />
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
          onLongPress={() => {
            navigation.navigate({ routeName: 'Organization' });
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
        <ServerErrorTest />
        <LinkRow
          onPress={() => {
            codePush.restartApp();
          }}
          icon="♻️"
          title="Refresh App"
        />
        <UpdateAirtableRow />
        <ClearMapButton />
      </RowSection>
      <AppInfoText />
    </SimplePage>
  );
}

KioskSettingsScreen.navigationOptions = SimplePage.navigationOptions;
