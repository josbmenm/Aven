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
import { rowStyle, rowTitleStyle, titleStyle } from '../components/Styles';
import useCloudReducer from '../cloud-core/useCloudReducer';
import useCloudValue from '../cloud-core/useCloudValue';
import useObservable from '../cloud-core/useObservable';
import useCloud from '../cloud-core/useCloud';
import DevicesReducer from '../logic/DevicesReducer';
import BlockForm from '../components/BlockForm';
import Title from '../components/Title';
import BlockFormButton from '../components/BlockFormButton';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormInput from '../components/BlockFormInput';
import KeyboardPopover from '../components/KeyboardPopover';
import { useCompanyConfig } from '../ono-cloud/OnoKitchen';
import useAsyncError from '../react-utils/useAsyncError';
import RestaurantReducer from '../logic/RestaurantReducer';

import { usePopover } from '../views/Popover';

function useInventoryState() {
  const config = useCompanyConfig();
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActionsUnburnt',
    RestaurantReducer,
  );
  const tables = config && config.baseTables;
  if (!tables || !restaurantState) {
    return null;
  }
  const slotsWithIngredients = Object.values(tables.KitchenSlots).map(slot => {
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
      estimatedRemaining: 77,
      estimatedRemaining: invState && invState.estimatedRemaining,
      name: slot.Ingredient.Name,
      photo: slot.Ingredient.Photo,
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

function SetFillForm({ slot, onClose }) {
  function setAmount(amount) {
    slot.onSetEstimatedRemaining(Math.ceil(amount * slot.ShotCapacity));
    onClose();
  }
  return (
    <View>
      <Text>Set {slot.name} fill state</Text>
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
    </View>
  );
}

function InventoryRow({ slot }) {
  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <SetFillForm onClose={onClose} slot={slot} />
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
        <Text>
          Name: {slot.name} Capacity: {slot.ShotCapacity}
        </Text>
        {estimatedRemaining && <Text>{estimatedRemaining} remaining</Text>}
        {percentFull && <Text>{percentFull}%</Text>}
      </View>

      <Button title="Set.." secondary onPress={onPopover} />
      <Button
        title="Set Full"
        onPress={() => {
          slot.onSetEstimatedRemaining(slot.ShotCapacity);
        }}
      />
    </Row>
  );
}

function Inventory() {
  const inventoryState = useInventoryState();
  if (!inventoryState) {
    return null;
  }
  const { inventorySections } = inventoryState;

  return inventorySections.map(inventorySection => {
    return (
      <RowSection title={`${inventorySection.icon} ${inventorySection.name}`}>
        {inventorySection.slots.map(slot => {
          return <InventoryRow slot={slot} key={slot.slotId} />;
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
