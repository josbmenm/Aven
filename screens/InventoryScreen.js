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

function DispenseForm({ slot, onClose, onDispense }) {
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

  return (
    <View>
      <PopoverTitle>Dispense {slot.name}</PopoverTitle>
      <View style={{ flexDirection: 'row' }}>{inputs}</View>
      <ButtonStack
        style={{ margin: 10 }}
        buttons={[
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
        ]}
      />
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

function InventorySlot({ slot, systemName, dispatch }) {
  const { onPopover: onFillPopover } = useKeyboardPopover(({ onClose }) => (
    <SetFillForm onClose={onClose} slot={slot} />
  ));

  const { onPopover: onDispensePopover } = useKeyboardPopover(({ onClose }) => (
    <DispenseForm onClose={onClose} slot={slot} onDispense={slot.onDispense} />
  ));

  const estimatedRemaining = slot.estimatedRemaining;
  const percentFull =
    estimatedRemaining &&
    Math.floor((estimatedRemaining / slot.ShotCapacity) * 100);

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
        {slot.settings && slot.settings.disabledMode === 'hard' && (
          <Tag
            size="small"
            color={Tag.warningColor}
            title="Force Enabled"
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
            { name: 'hard enable', value: 'hard' },
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
  return (
    <React.Fragment>
      <AsyncButton title="Enable All Hoppers" onPress={() => {}} disabled />
      <AsyncButton title="Disable All Hoppers" onPress={() => {}} disabled />
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
      <TempGauge title="Freezer Temperature" tag="System_FreezerTemp_READ" />
    </React.Fragment>
  );
}

function BeverageSubsystem() {
  return (
    <React.Fragment>
      <TempGauge title="Fridge Temperature" tag="System_BevTemp_READ" />
      <AsyncButton title="Enable All Pumps" onPress={() => {}} disabled />
      <AsyncButton title="Disable All Pumps" onPress={() => {}} disabled />
      <AsyncButton title="Purge All" onPress={() => {}} disabled />
    </React.Fragment>
  );
}
function CupsSubsystem({ systemState }) {
  return (
    <React.Fragment>
      <RemainderTag estimatedRemaining={systemState.estimatedRemaining} />
      <KitchenCommandButton commandType="DispenseCup" title="dispense cup" />
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

function InventorySystem({ system, dispatch }) {
  const SubsystemSection = SubsystemSections[system.id];
  return (
    <React.Fragment>
      <ScrollView style={{ width: 330, padding: 12 }}>
        <Text style={{ ...titleStyle, fontSize: 24, marginHorizontal: 8 }}>
          {system.name}
        </Text>
        {SubsystemSection && (
          <SubsystemSection systemState={system} dispatch={dispatch} />
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
            />
          );
        })}
    </React.Fragment>
  );
}

function Inventory() {
  const [inventoryState, dispatch] = useInventoryState();
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
