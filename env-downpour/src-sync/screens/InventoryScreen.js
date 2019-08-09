import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import RowSection from '../components/RowSection';
import { Text, View } from 'react-native';
import SimplePage from '../components/SimplePage';
import Button from '../components/Button';
import Row from '../components/Row';
import Spinner from '../components/Spinner';
import { Easing } from 'react-native-reanimated';
import BitRow from '../components/BitRow';
import {
  rowStyle,
  rowTitleStyle,
  titleStyle,
  proseFontFace,
  monsterraLight,
  standardTextColor,
} from '../components/Styles';
import {
  useCloudReducer,
  useCloud,
  useCloudValue,
} from '../cloud-core/KiteReact';
import DevicesReducer from '../logic/DevicesReducer';
import BlockForm from '../components/BlockForm';
import Title from '../components/Title';
import BlockFormButton from '../components/BlockFormButton';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormInput from '../components/BlockFormInput';
import KeyboardPopover from '../components/KeyboardPopover';
import { useCompanyConfig } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import useAsyncError from '../react-utils/useAsyncError';
import RestaurantReducer from '../logic/RestaurantReducer';

import { usePopover } from '../views/Popover';

function useInventoryState() {
  const config = useCompanyConfig();
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActions',
    RestaurantReducer,
  );
  const tables = config && config.baseTables;
  if (!tables || !restaurantState) {
    return null;
  }
  const slotsWithIngredients = Object.values(tables.KitchenSlots)
    .sort((a, b) => {
      a._index - b._index;
    })
    .map(slot => {
      const Ingredient =
        tables.Ingredients[slot.Ingredient && slot.Ingredient[0]];
      return {
        ...slot,
        Ingredient,
      };
    });
  const systemSections = {};
  slotsWithIngredients.forEach(slot => {
    const systemId = slot.KitchenSystem[0];
    if (!systemSections[systemId]) {
      const system = tables.KitchenSystems[systemId];
      systemSections[systemId] = {
        id: system.id,
        name: system.Name,
        icon: system.Icon,
        slots: [],
      };
    }
    const invState =
      restaurantState.ingredientInventory &&
      restaurantState.ingredientInventory[slot.id];
    systemSections[systemId].slots.push({
      ...slot,
      estimatedRemaining: invState && invState.estimatedRemaining,
      name: slot.Ingredient.Name,
      photo: slot.Ingredient.Icon,
      color: slot.Ingredient.Color,
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
          estimatedRemaining:
            restaurantState.cupInventory &&
            restaurantState.cupInventory.estimatedRemaining,
          ShotCapacity: 150,
          ShotsAfterLow: 15,
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
  return { inventorySections };
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

function SlotRunButtons({ slot, onClose }) {
  return (
    <View>
      <PopoverTitle>Run {slot.name}</PopoverTitle>
      <Button title="Dispense One" onPress={() => {}} />
      <Button title="Dispense Until Empty" onPress={() => {}} />
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
function InventoryRow({ slot }) {
  const { onPopover: onFillPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <SetFillForm onClose={onClose} slot={slot} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );

  const { onPopover: onRunPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <SlotRunButtons onClose={onClose} slot={slot} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );
  const estimatedRemaining = slot.estimatedRemaining;
  const percentFull =
    estimatedRemaining &&
    Math.floor((estimatedRemaining / slot.ShotCapacity) * 100);
  return (
    <Row>
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
          <Text style={{ ...titleStyle, fontSize: 24 }}>{slot.name}</Text>
        </View>
        <InfoText>
          Capacity: {slot.ShotCapacity}. Has {slot.ShotsAfterLow} shots after
          low.
        </InfoText>
        {estimatedRemaining && (
          <InfoText>{estimatedRemaining} remaining</InfoText>
        )}
        {percentFull && <InfoText>{percentFull}% full</InfoText>}
      </View>

      <View style={{ flexDirection: 'row' }}>
        <Button title="Run.." onPress={onRunPopover} />
        <Button title="Fill.." secondary onPress={onFillPopover} />
      </View>
    </Row>
  );
}

function Inventory() {
  const inventoryState = useInventoryState();
  if (!inventoryState) {
    return null;
  }
  const { inventorySections } = inventoryState;

  return inventorySections.map(section => {
    return (
      <RowSection title={`${section.icon} ${section.name}`} key={section.id}>
        {section.slots.map(slot => {
          return <InventoryRow slot={slot} key={slot.id} />;
        })}
      </RowSection>
    );
  });
}

export default function InventoryScreen(props) {
  return (
    <SimplePage title="Inventory" icon="🍍" {...props}>
      <RootAuthenticationSection>
        <Inventory />
      </RootAuthenticationSection>
    </SimplePage>
  );
}

InventoryScreen.navigationOptions = SimplePage.navigationOptions;
