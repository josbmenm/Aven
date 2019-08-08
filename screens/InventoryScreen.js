import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import RowSection from '../components/RowSection';
import { Text, View } from 'react-native';
import SimplePage from '../components/SimplePage';
import Tag from '../components/Tag';
import Button from '../components/Button';
import Row from '../components/Row';
import useKeyboardPopover from '../components/useKeyboardPopover';
import {
  titleStyle,
  proseFontFace,
  standardTextColor,
  prettyShadowSmall,
} from '../components/Styles';
import { useCloud } from '../cloud-core/KiteReact';
import { useCompanyConfig } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import MultiSelect from '../components/MultiSelect';
import { white } from 'ansi-colors';

function useInventoryState() {
  const cloud = useCloud();
  const config = useCompanyConfig();
  const [restaurantState, dispatch] = useRestaurantState();
  const tables = config && config.baseTables;
  if (!tables || !restaurantState) {
    return [null, dispatch];
  }
  const slotsWithIngredients = Object.values(tables.KitchenSlots)
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
  const systemSections = {};
  slotsWithIngredients.forEach(slot => {
    const systemId = slot.KitchenSystem.id;
    if (!systemSections[systemId]) {
      systemSections[systemId] = {
        id: slot.KitchenSystem.id,
        name: slot.KitchenSystem.Name,
        icon: slot.KitchenSystem.Icon,
        slots: [],
      };
    }
    const invState =
      restaurantState.ingredientInventory &&
      restaurantState.ingredientInventory[slot.id];
    systemSections[systemId].slots.push({
      ...slot,
      settings:
        (restaurantState.slotSettings &&
          restaurantState.slotSettings[slot.id]) ||
        {},
      estimatedRemaining: invState && invState.estimatedRemaining,
      name: slot.Ingredient.Name,
      photo: slot.Ingredient.Icon,
      color: slot.Ingredient.Color,
      onDispenseOne: async () => {
        await cloud.dispatch({
          type: 'KitchenCommand',
          command: 'DispenseOnly',
          params: {
            amount: 1,
            slot: slot.Slot,
            system: slot.KitchenSystem.FillSystemID,
          },
        });
        await dispatch({
          type: 'DidDispense',
          slotId: slot.id,
          amount: 1,
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
    });
  });

  const inventorySections = [
    {
      name: 'Cups',
      id: 'cups',
      icon: '🥤',
      slots: [
        {
          id: 'cups',
          name: 'Cups',
          settings: {},
          disableFilling: true,
          isCups: true,
          estimatedRemaining:
            restaurantState.cupInventory &&
            restaurantState.cupInventory.estimatedRemaining,
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
          onSetEstimatedRemaining: value => {
            return dispatch({
              type: 'DidFillCups',
              estimatedRemaining: value,
            });
          },
        },
      ],
    },
    ...Object.values(systemSections),
  ];
  return [{ inventorySections }, dispatch];
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
            {slot.name} (slot {slot.Slot})
          </Text>
        </View>
        {isCups && <Tag color={Tag.positiveColor} title="20+ remaining" />}
        <InfoText>
          Capacity: {slot.ShotCapacity}. Has {slot.ShotsAfterLow} shots after
          low.
        </InfoText>
        {estimatedRemaining != null && (
          <InfoText>{estimatedRemaining} remaining</InfoText>
        )}
        {percentFull != null && <InfoText>{percentFull}% full</InfoText>}
      </View>

      {!isCups && (
        <View
          style={{
            marginTop: 30,
            flex: 1,
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

      <View style={{ flexDirection: 'row' }}>
        <Button title="dispense one" onPress={slot.onDispenseOne} />
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
    </View>
  );
}

function Inventory() {
  const [inventoryState, dispatch] = useInventoryState();
  if (!inventoryState) {
    return null;
  }
  const { inventorySections } = inventoryState;

  return inventorySections.map(section => {
    return (
      <RowSection title={`${section.icon} ${section.name}`} key={section.id}>
        {section.slots.map(slot => {
          return <InventoryRow slot={slot} key={slot.id} dispatch={dispatch} />;
        })}
      </RowSection>
    );
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
