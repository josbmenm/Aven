import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import { Text, View, ScrollView } from 'react-native';
import GenericPage from '../components/GenericPage';
import Tag from '../components/Tag';
import Button from '../components/Button';
import AsyncButton from '../components/AsyncButton';
import useFocus from '../navigation-hooks/useFocus';
import useKeyboardPopover from '../components/useKeyboardPopover';
import { titleStyle, prettyShadowSmall, monsterra } from '../components/Styles';
import AirtableImage from '../components/AirtableImage';
import { useInventoryState, useKitchenState } from '../ono-cloud/OnoKitchen';
import MultiSelect from '../components/MultiSelect';
import BlockFormInput from '../components/BlockFormInput';
import StatusBar from '../components/StatusBar';
import ButtonStack from '../components/ButtonStack';
import { TempCell, formatTemp } from '../components/TemperatureView';
import KitchenCommandButton from '../components/KitchenCommandButton';
import { useRestaurantState } from '../ono-cloud/Kitchen';

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

function SubTitle({ children }) {
  return (
    <Text
      style={{
        ...titleStyle,
        marginTop: 24,
        marginBottom: 4,
        fontSize: 18,
        color: Tag.neutralColor,
      }}
    >
      {children}
    </Text>
  );
}

function SetFillForm({ slot, onClose }) {
  const [amount, setAmount] = React.useState('10');

  let unit = { name: 'shots', factor: 1 };

  const shotMass = slot.Ingredient['Mass (g/shot)'];
  const shotVolume = slot.Ingredient['ShotSize(ml)'];

  if (
    slot.KitchenSystem.Name === 'Powder' ||
    slot.KitchenSystem.Name === 'Granules'
  ) {
    unit = { name: 'kg', factor: 1000 / shotMass };
  } else if (
    slot.KitchenSystem.Name === 'FrozenFood' ||
    slot.KitchenSystem.Name === 'Piston'
  ) {
    unit = { name: 'Lbs', factor: 453.6 / shotMass };
  } else if (slot.KitchenSystem.Name === 'Beverage') {
    unit = { name: 'L', factor: 1000 / shotVolume };
  }
  function handleSubmit() {
    onClose();
    slot.onAddToEstimatedRemaining(Math.floor(amount * unit.factor));
  }

  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      props => (
        <BlockFormInput
          {...props}
          label="amount"
          value={amount}
          onValue={setAmount}
        />
      ),
    ],
  });

  return (
    <View>
      <PopoverTitle>Fill {slot.name}</PopoverTitle>
      <View style={{ flexDirection: 'row' }}>{inputs}</View>
      <Button
        title={`fill ${amount} ${unit.name}`}
        onPress={handleSubmit}
        style={{ margin: 8 }}
      />
    </View>
  );
}

function DispenseForm({ slot, onClose, onDispense, onPositionAndDispense }) {
  const [amount, setAmount] = React.useState('2');
  function handleSubmit() {}
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      props => (
        <BlockFormInput
          {...props}
          label="amount"
          value={amount}
          onValue={setAmount}
        />
      ),
    ],
  });

  const buttons = [
    <AsyncButton
      title="dispense one"
      onPress={async () => {
        await onDispense(1);
      }}
    />,
    <AsyncButton
      title={`dispense ${amount}`}
      onPress={async () => {
        await onDispense(amount);
      }}
    />,
  ];
  if (onPositionAndDispense) {
    buttons.push(
      <AsyncButton
        title={`fill cup with ${amount}`}
        onPress={async () => {
          await onPositionAndDispense(amount);
        }}
      />,
    );
  }

  return (
    <View>
      <PopoverTitle>Dispense {slot.name}</PopoverTitle>
      <View style={{ flexDirection: 'row' }}>{inputs}</View>
      <ButtonStack style={{ margin: 10 }} buttons={buttons} />
    </View>
  );
}

function RemainderTag({ estimatedRemaining }) {
  if (estimatedRemaining == null) {
    return null;
  }
  return (
    <Tag
      size="small"
      color={
        typeof estimatedRemaining === 'string' || estimatedRemaining > 10
          ? Tag.neutralColor
          : estimatedRemaining <= 0
          ? Tag.negativeColor
          : Tag.warningColor
      }
      title={`${estimatedRemaining} remaining`}
      style={{ marginRight: 8, marginBottom: 8 }}
    />
  );
}

function InventorySlot({ slot, systemName, dispatch, restaurantState }) {
  const { onPopover: onFillPopover } = useKeyboardPopover(({ onClose }) => (
    <SetFillForm onClose={onClose} slot={slot} />
  ));

  const { onPopover: onDispensePopover } = useKeyboardPopover(({ onClose }) => (
    <DispenseForm
      onClose={onClose}
      slot={slot}
      onDispense={slot.onDispense}
      onPositionAndDispense={
        restaurantState.manualMode ? slot.onPositionAndDispense : null
      }
    />
  ));
  if (!slot) {
    return null;
  }
  const estimatedRemaining = slot.estimatedRemaining;

  return (
    <ScrollView
      style={{
        ...prettyShadowSmall,
        backgroundColor: 'white',
        padding: 12,
        marginVertical: 15,
        borderRadius: 4,
        width: 330,
      }}
    >
      {slot.Slot != null && (
        <Text style={{ ...titleStyle, fontSize: 20, marginHorizontal: 8 }}>
          {slot.ingredientName}
        </Text>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ ...titleStyle, fontSize: 18, marginHorizontal: 8 }}>
          {slot.name}
        </Text>

        {slot.Ingredient && slot.Ingredient.Icon && (
          <AirtableImage
            image={slot.Ingredient.Icon}
            style={{
              width: 28,
              height: 28,
              resizeMode: 'contain',
              tintColor: slot.color,
              marginRight: 4,
            }}
            resizeMode="contain"
            tintColor={monsterra}
          />
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          height: 80,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <RemainderTag estimatedRemaining={estimatedRemaining} />
        {slot.settings && slot.settings.disabledMode === true && (
          <Tag
            size="small"
            color={Tag.negativeColor}
            title="Disabled"
            style={{ marginRight: 8, marginBottom: 8 }}
          />
        )}
        {slot.settings && slot.settings.optional && (
          <Tag
            size="small"
            color={Tag.warningColor}
            title="Optional"
            style={{ marginRight: 8, marginBottom: 8 }}
          />
        )}
        {!!slot.isErrored && (
          <Tag
            size="small"
            color={Tag.negativeColor}
            title={`Errored`}
            style={{ marginRight: 8, marginBottom: 8 }}
          />
        )}
        {slot.hopperDisabled && (
          <Tag
            size="small"
            color={Tag.negativeColor}
            title={`Hopper Off`}
            style={{ marginRight: 8, marginBottom: 8 }}
          />
        )}
        {slot.pumpDisabled && (
          <Tag
            size="small"
            color={Tag.negativeColor}
            title={`Pump Off`}
            style={{ marginRight: 8, marginBottom: 8 }}
          />
        )}
        {!!slot.dispensedSinceLow && (
          <Tag
            size="small"
            color={Tag.warningColor}
            title={`${slot.dispensedSinceLow} since low`}
            style={{ marginRight: 8, marginBottom: 8 }}
          />
        )}
      </View>

      {slot.trackFilling && (
        <React.Fragment>
          <SubTitle>Inventory Filling</SubTitle>
          <View style={{ flexDirection: 'row' }}>
            <Button
              title="fill.."
              type="outline"
              onPress={onFillPopover}
              style={{ marginRight: 8 }}
            />
            <Button
              title="empty"
              onPress={async () => {
                await slot.onSetEstimatedRemaining(0);
              }}
            />
          </View>
        </React.Fragment>
      )}

      <SubTitle>Test Dispensing</SubTitle>

      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {systemName === 'Beverage' && (
          <AsyncButton
            title="purge small"
            onPress={slot.onPurgeSmall}
            style={{ marginRight: 8 }}
          />
        )}
        {systemName === 'Beverage' && (
          <AsyncButton title="purge large" onPress={slot.onPurgeLarge} />
        )}
      </View>

      <AsyncButton
        title="test dispense.."
        type="outline"
        onPress={onDispensePopover}
      />

      <SubTitle>Menu Settings</SubTitle>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <MultiSelect
          options={[
            { name: 'disable', value: true },
            { name: 'enable', value: false },
          ]}
          onValue={disabledMode => {
            dispatch({
              type: 'SetSlotSettings',
              slotId: slot.id,
              disabledMode,
            });
          }}
          value={slot.settings.disabledMode || false}
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <MultiSelect
          options={[
            { name: 'optional', value: true },
            { name: 'mandatory', value: false },
          ]}
          onValue={optional => {
            dispatch({
              type: 'SetSlotSettings',
              slotId: slot.id,
              optional,
            });
          }}
          value={!!slot.settings.optional}
        />
      </View>
    </ScrollView>
  );
}

function FrozenFoodSubsystem() {
  const [restaurantState, dispatch] = useRestaurantState();
  const isEnabled = !restaurantState.disableFrozenHoppers;
  return (
    <React.Fragment>
      <TempGauge title="Freezer Temperature" tag="System_FreezerTemp_READ" />
      <KitchenCommandButton commandType="FrozenPurgeAll" title="purge all" />
      <SubTitle>Un-jamming</SubTitle>
      <KitchenCommandButton
        commandType="FrozenVibrateAll"
        title="vibrate all"
      />
      <KitchenCommandButton
        commandType="FrozenStopVibrateAll"
        title="stop vibrating all"
      />
      <SubTitle>Food Hoppers</SubTitle>
      <View style={{ marginBottom: 12, flexDirection: 'row' }}>
        <MultiSelect
          options={[
            { name: 'Enabled', value: true },
            { name: 'Disabled', value: false },
          ]}
          onValue={isEnabled => {
            dispatch({
              type: 'SetFrozenHoppersEnabled',
              isEnabled,
            });
          }}
          value={isEnabled}
        />
      </View>
    </React.Fragment>
  );
}

function BeverageSubsystem() {
  const [restaurantState, dispatch] = useRestaurantState();
  const isEnabled = !restaurantState.disableBeveragePumps;
  return (
    <React.Fragment>
      <TempGauge title="Fridge Temperature" tag="System_BevTemp_READ" />
      <SubTitle>Purging</SubTitle>
      <KitchenCommandButton commandType="BeveragePurgeAll" title="purge all" />
      <KitchenCommandButton
        commandType="BeverageStopPurgeAll"
        title="stop purge all"
      />
      <SubTitle>Pumps</SubTitle>
      <View style={{ marginBottom: 12, flexDirection: 'row' }}>
        <MultiSelect
          options={[
            { name: 'Enabled', value: true },
            { name: 'Disabled', value: false },
          ]}
          onValue={isEnabled => {
            dispatch({
              type: 'SetBeveragePumpsEnabled',
              isEnabled,
            });
          }}
          value={isEnabled}
        />
      </View>
    </React.Fragment>
  );
}
function CupsSubsystem({ systemState, restaurantState }) {
  console.log('ah', restaurantState);
  return (
    <React.Fragment>
      <RemainderTag estimatedRemaining={systemState.estimatedRemaining} />
      <KitchenCommandButton commandType="DispenseCup" title="dispense cup" />
      {restaurantState.manualMode && (
        <KitchenCommandButton commandType="GetCup" title="grab new cup" />
      )}
    </React.Fragment>
  );
}

function TempGauge({ title, tag }) {
  const kitchenState = useKitchenState();
  const value = kitchenState && formatTemp(kitchenState[tag]);
  return <TempCell title={title} value={value} />;
}
function PistonSubsystem() {
  return (
    <React.Fragment>
      <TempGauge title="Fridge Temperature" tag="System_YogurtZoneTemp_READ" />
    </React.Fragment>
  );
}

const SubsystemSections = {
  FrozenFood: FrozenFoodSubsystem,
  Cups: CupsSubsystem,
  Beverage: BeverageSubsystem,
  Piston: PistonSubsystem,
};

function InventorySystem({ system, dispatch, restaurantState }) {
  const SubsystemSection = SubsystemSections[system.id];
  return (
    <React.Fragment>
      <ScrollView style={{ width: 330, padding: 12 }}>
        <Text style={{ ...titleStyle, fontSize: 24, marginHorizontal: 8 }}>
          {system.name}
        </Text>
        {SubsystemSection && (
          <SubsystemSection
            systemState={system}
            dispatch={dispatch}
            restaurantState={restaurantState}
          />
        )}
      </ScrollView>
      {system.slots &&
        system.slots.map(slot => {
          return (
            <InventorySlot
              slot={slot}
              key={slot.id}
              systemName={system.name}
              dispatch={dispatch}
              restaurantState={restaurantState}
            />
          );
        })}
    </React.Fragment>
  );
}

function Inventory() {
  const [inventoryState, dispatch, restaurantState] = useInventoryState();
  if (!inventoryState) {
    return null;
  }
  const { inventorySystems } = inventoryState;
  return (
    <View style={{ flexDirection: 'row' }}>
      {inventorySystems.map(system => {
        return (
          <InventorySystem
            system={system}
            key={system.id}
            dispatch={dispatch}
            restaurantState={restaurantState}
          />
        );
      })}
    </View>
  );
}

export default function InventoryScreen(props) {
  return (
    <GenericPage
      hideBackButton
      {...props}
      afterScrollView={<StatusBar />}
      disableScrollView
    >
      <ScrollView horizontal style={{ flex: 1 }}>
        <RootAuthenticationSection>
          <Inventory />
        </RootAuthenticationSection>
      </ScrollView>
    </GenericPage>
  );
}

InventoryScreen.navigationOptions = GenericPage.navigationOptions;
