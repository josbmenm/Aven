import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import RowSection from '../components/RowSection';
import { Text, View } from 'react-native';
import SimplePage from '../components/SimplePage';
import Tag from '../components/Tag';
import Button from '../components/Button';
import Row from '../components/Row';
import useFocus from '../navigation-hooks/useFocus';
import useKeyboardPopover from '../components/useKeyboardPopover';
import {
  titleStyle,
  proseFontFace,
  standardTextColor,
  prettyShadowSmall,
} from '../components/Styles';
import { useCloud, useCloudValue } from '../cloud-core/KiteReact';
import { useCompanyConfig } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { useInventoryState } from '../ono-cloud/OnoKitchen';
import MultiSelect from '../components/MultiSelect';
import BlockFormInput from '../components/BlockFormInput';

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
  function setAmount(amount) {
    slot.onSetEstimatedRemaining(Math.ceil(amount * slot.ShotCapacity));
    onClose();
  }
  return (
    <View>
      <PopoverTitle>Set {slot.name} fill state</PopoverTitle>
      <Button
        title="100%"
        onPress={() => {
          setAmount(1);
        }}
      />
      <Button
        title="75%"
        onPress={() => {
          setAmount(0.75);
        }}
      />
      <Button
        title="50%"
        onPress={() => {
          setAmount(0.5);
        }}
      />
      <Button
        title="25%"
        onPress={() => {
          setAmount(0.25);
        }}
      />
      <Button
        title="Empty"
        onPress={() => {
          setAmount(0);
        }}
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
      <Button
        title="dispense one"
        onPress={() => {
          onDispense(1);
        }}
      />
      <Button
        title={`dispense ${amount}`}
        onPress={() => {
          onDispense(amount);
        }}
      />
      <Button
        title={`task cup of ${slot.name} x ${amount}`}
        onPress={() => {}}
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
function InventoryRow({ slot, dispatch }) {
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
    <View
      style={{
        ...prettyShadowSmall,
        backgroundColor: 'white',
        padding: 12,
        marginVertical: 15,
        borderRadius: 4,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
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
            {slot.Slot != null &&
              ` (${slot.KitchenSystem.Name} slot ${slot.Slot})`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          {estimatedRemaining != null && (
            <Tag
              color={
                estimatedRemaining > 0 ? Tag.positiveColor : Tag.negativeColor
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
          {!!slot.isErrored && (
            <Tag color={Tag.negativeColor} title={`Errored`} />
          )}
          {!!slot.isEmpty && <Tag color={Tag.negativeColor} title={`Empty`} />}
          {!!slot.dispensedSinceLow && (
            <Tag
              color={Tag.warningColor}
              title={`${slot.dispensedSinceLow} since low`}
            />
          )}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginVertical: 16,
        }}
      >
        {isCups ? (
          <Button title="dispense one" onPress={slot.onDispenseOne} />
        ) : (
          <Button title="dispense.." onPress={onDispensePopover} />
        )}
        {isBeverage && (
          <Button title="purge small" onPress={slot.onPurgeSmall} />
        )}
        {isBeverage && (
          <Button title="purge large" onPress={slot.onPurgeLarge} />
        )}
        {!slot.disableFilling && (
          <Button title="fill.." secondary onPress={onFillPopover} />
        )}
      </View>

      {!isCups && (
        <View
          style={{
            marginVertical: 16,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
        >
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
        </View>
      )}
    </View>
  );
}

function Inventory() {
  const [inventoryState, dispatch] = useInventoryState();
  if (!inventoryState) {
    return null;
  }
  const { inventorySlots } = inventoryState;

  return inventorySlots.map(slot => {
    return <InventoryRow slot={slot} key={slot.id} dispatch={dispatch} />;
  });
}

export default function InventoryScreen(props) {
  return (
    <SimplePage hideBackButton {...props}>
      <RootAuthenticationSection>
        <Inventory />
      </RootAuthenticationSection>
    </SimplePage>
  );
}

InventoryScreen.navigationOptions = SimplePage.navigationOptions;

// InventoryScreen.stateStreamHook = useInventoryState
