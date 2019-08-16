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
import { useRestaurantState } from '../ono-cloud/Kitchen';
import MultiSelect from '../components/MultiSelect';
import BlockFormInput from '../components/BlockFormInput';

function getCupsInventoryState(restaurantState, kitchenState) {
  let isEmpty = false;
  let isErrored = !kitchenState.Denester_NoFaults_READ;
  let estimatedRemaining = '20+';
  if (kitchenState.Denester_DispensedSinceLow_READ) {
    estimatedRemaining = 19 - kitchenState.Denester_DispensedSinceLow_READ;
    isEmpty = estimatedRemaining <= 0;
  }
  return {
    estimatedRemaining,
    isEmpty,
    isErrored,
  };
}

function getInventoryState(restaurantState, kitchenState) {
  if (!kitchenState || !restaurantState) {
    return {};
  }
  const slots = {};

  return {
    cups: getCupsInventoryState(restaurantState, kitchenState),
    slots,
  };
}

function useInventoryState() {
  const cloud = useCloud();
  const config = useCompanyConfig();
  const kitchenState = useCloudValue('KitchenState');
  const [restaurantState, dispatch] = useRestaurantState();
  const inventoryState = getInventoryState(restaurantState, kitchenState);
  const tables = config && config.baseTables;
  if (!tables || !restaurantState) {
    return [null, dispatch];
  }
  const ingredientSlots = Object.values(tables.KitchenSlots)
    .sort((a, b) => {
      a._index - b._index;
    })
    .map(slot => {
      const Ingredient =
        tables.Ingredients[slot.Ingredient && slot.Ingredient[0]];
      const KitchenSystem =
        tables.KitchenSystems[slot.KitchenSystem && slot.KitchenSystem[0]];
      return {
        ...slot,
        Ingredient,
        KitchenSystem,
      };
    });
  const inventorySlots = [
    {
      id: 'cups',
      name: 'Cups',
      settings: {},
      disableFilling: true,
      isCups: true,
      estimatedRemaining: inventoryState.cups.estimatedRemaining,
      isEmpty: inventoryState.cups.isEmpty,
      isErrored: inventoryState.cups.isErrored,
      ShotCapacity: 50,
      ShotsAfterLow: 18,
      onDispenseOne: async () => {
        await cloud.dispatch({
          type: 'KitchenCommand',
          command: 'DispenseCup',
        });
        await dispatch({
          type: 'DidDispenseCup',
        });
      },
    },
    ...ingredientSlots.map(slot => {
      const invState =
        restaurantState.ingredientInventory &&
        restaurantState.ingredientInventory[slot.id];
      const dispensedSinceLow =
        kitchenState &&
        kitchenState[
          `${slot.KitchenSystem.Name}_Slot_${slot.Slot}_DispensedSinceLow_READ`
        ];
      const isLowSensed =
        kitchenState &&
        kitchenState[`${slot.KitchenSystem.Name}_Slot_${slot.Slot}_IsLow_READ`];
      const isErrored =
        kitchenState &&
        kitchenState[`${slot.KitchenSystem.Name}_Slot_${slot.Slot}_Error_READ`];
      return {
        ...slot,
        settings:
          (restaurantState.slotSettings &&
            restaurantState.slotSettings[slot.id]) ||
          {},
        estimatedRemaining: invState && invState.estimatedRemaining,
        dispensedSinceLow,
        isEmpty: false,
        isErrored,
        isLowSensed,
        name: slot.Ingredient.Name,
        photo: slot.Ingredient.Icon,
        color: slot.Ingredient.Color,
        onDispense: async amount => {
          await cloud.dispatch({
            type: 'KitchenCommand',
            command: 'DispenseOnly',
            params: {
              amount: amount,
              slot: slot.Slot,
              system: slot.KitchenSystem.FillSystemID,
            },
          });
          await dispatch({
            type: 'DidDispense',
            slotId: slot.id,
            amount: amount,
          });
        },
        onPurgeSmall: async () => {
          const amount = 40;
          await cloud.dispatch({
            type: 'KitchenCommand',
            command: 'DispenseOnly',
            params: {
              amount,
              slot: slot.Slot,
              system: slot.KitchenSystem.FillSystemID,
            },
          });
          await dispatch({
            type: 'DidDispense',
            slotId: slot.id,
            amount,
          });
        },
        onPurgeLarge: async () => {
          const amount = 120;
          await cloud.dispatch({
            type: 'KitchenCommand',
            command: 'DispenseOnly',
            params: {
              amount,
              slot: slot.Slot,
              system: slot.KitchenSystem.FillSystemID,
            },
          });
          await dispatch({
            type: 'DidDispense',
            slotId: slot.id,
            amount,
          });
        },
        onSetEstimatedRemaining: value => {
          return dispatch({
            type: 'DidFillSlot',
            slotId: slot.id,
            estimatedRemaining: value,
          });
        },
      };
    }),
  ];

  return [{ inventorySlots }, dispatch];
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
  const [amount, setAmount] = React.useState(1);
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
          <Text style={{ ...titleStyle, fontSize: 24 }}>
            {slot.name}
            {slot.Slot != null &&
              ` (${slot.KitchenSystem.Name} slot ${slot.Slot})`}
          </Text>
        </View>
        {!!estimatedRemaining && (
          <Tag
            color={Tag.positiveColor}
            title={`${estimatedRemaining} remaining`}
          />
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
        <InfoText>
          Capacity: {slot.ShotCapacity}. Has {slot.ShotsAfterLow} shots after
          low.
        </InfoText>
        {percentFull != null && <InfoText>{percentFull}% full</InfoText>}
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
              { name: 'enable', value: true },
              { name: 'disable', value: false },
            ]}
            onValue={enabled => {
              dispatch({
                type: 'SetSlotSettings',
                slotId: slot.id,
                enabled,
              });
            }}
            value={!!slot.settings.enabled}
          />
          <MultiSelect
            options={[
              { name: 'mandatory', value: true },
              { name: 'optional', value: false },
            ]}
            onValue={mandatory => {
              dispatch({
                type: 'SetSlotSettings',
                slotId: slot.id,
                mandatory,
              });
            }}
            value={!!slot.settings.mandatory}
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
