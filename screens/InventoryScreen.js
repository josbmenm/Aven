import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import { Text, View, ScrollView } from 'react-native';
import GenericPage from '../components/GenericPage';
import Tag from '../components/Tag';
import Button from '../components/Button';
import AsyncButton from '../components/AsyncButton';
import useFocus from '../navigation-hooks/useFocus';
import useKeyboardPopover from '../components/useKeyboardPopover';
import {
  titleStyle,
  proseFontFace,
  standardTextColor,
  prettyShadowSmall,
} from '../components/Styles';
import AirtableImage from '../components/AirtableImage';
import { useInventoryState } from '../ono-cloud/OnoKitchen';
import MultiSelect from '../components/MultiSelect';
import BlockFormInput from '../components/BlockFormInput';
import StatusBar from '../components/StatusBar';
import ButtonStack from '../components/ButtonStack';

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
    slot.onSetEstimatedRemaining(Math.floor(amount * unit.factor));
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

function InfoText({ children }) {
  return (
    <Text style={{ ...proseFontFace, color: standardTextColor }}>
      {children}
    </Text>
  );
}
function InventorySlot({ slot, dispatch }) {
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
  const isBeverage =
    !!slot.KitchenSystem && slot.KitchenSystem.Name === 'Beverage';
  const isCups = !!slot.isCups;
  return (
    <ScrollView
      style={{
        ...prettyShadowSmall,
        backgroundColor: 'white',
        padding: 12,
        marginVertical: 15,
        borderRadius: 4,
        width: 340,
      }}
    >
      {slot.Slot != null && (
        <Text style={{ ...titleStyle, fontSize: 24, marginHorizontal: 8 }}>
          {slot.KitchenSystem.Name}
          {slot.Slot}
        </Text>
      )}
      {slot.photo && (
        <AirtableImage
          image={slot.photo}
          style={{
            width: 36,
            height: 36,
            resizeMode: 'contain',
            tintColor: slot.color,
            marginRight: 4,
          }}
          resizeMode="contain"
          tintColor={slot.color}
        />
      )}
      <Text style={{ ...titleStyle, fontSize: 24, marginHorizontal: 8 }}>
        {slot.name}
      </Text>
      {estimatedRemaining != null && (
        <Tag
          color={
            typeof estimatedRemaining === 'string' || estimatedRemaining > 0
              ? Tag.positiveColor
              : Tag.negativeColor
          }
          title={`${estimatedRemaining} remaining`}
        />
      )}
      {slot.settings && slot.settings.disabledMode === true && (
        <Tag color={Tag.negativeColor} title="Disabled" />
      )}
      {slot.settings && slot.settings.disabledMode === 'hard' && (
        <Tag color={Tag.warningColor} title="Hard Enabled" />
      )}
      {slot.settings && slot.settings.optional && (
        <Tag color={Tag.warningColor} title="Optional Ingredient" />
      )}
      {!!slot.isErrored && <Tag color={Tag.negativeColor} title={`Errored`} />}
      {!!slot.isEmpty && <Tag color={Tag.negativeColor} title={`Empty`} />}
      {!!slot.dispensedSinceLow && (
        <Tag
          color={Tag.warningColor}
          title={`${slot.dispensedSinceLow} since low`}
        />
      )}

      {isCups ? (
        <AsyncButton title="dispense one" onPress={slot.onDispenseOne} />
      ) : (
        <AsyncButton title="dispense.." onPress={onDispensePopover} />
      )}
      {isBeverage && (
        <AsyncButton title="purge small" onPress={slot.onPurgeSmall} />
      )}
      {isBeverage && (
        <AsyncButton title="purge large" onPress={slot.onPurgeLarge} />
      )}
      {!slot.disableFilling && (
        <AsyncButton title="fill.." secondary onPress={onFillPopover} />
      )}

      {!isCups && (
        <React.Fragment>
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
        </React.Fragment>
      )}
    </ScrollView>
  );
}

function Inventory() {
  const [inventoryState, dispatch] = useInventoryState();
  if (!inventoryState) {
    return null;
  }
  const { inventorySlots } = inventoryState;

  return (
    <View style={{ flexDirection: 'row' }}>
      {inventorySlots.map(slot => {
        return <InventorySlot slot={slot} key={slot.id} dispatch={dispatch} />;
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

// InventoryScreen.stateStreamHook = useInventoryState
