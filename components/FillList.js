import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Button from './Button';
import { primaryFontFace } from './Styles';
import AirtableImage from './AirtableImage';
import { Easing } from 'react-native-reanimated';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import BlockFormInput from './BlockFormInput';
import Subtitle from './Subtitle';
import useFocus from '../navigation-hooks/useFocus';
import { useCompanyConfig } from '../ono-cloud/OnoKitchen';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import Tag from './Tag';

function useSlotsWithIngredients() {
  const config = useCompanyConfig();
  const [restaurantState, dispatch] = useRestaurantState();
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
      const KitchenSystem =
        tables.KitchenSystems[slot.KitchenSystem && slot.KitchenSystem[0]];
      return {
        ...slot,
        Ingredient,
        KitchenSystem,
      };
    });
  return slotsWithIngredients;
}

function EditFillForm({ onClose, onSubmit, initialAmount, ingredientName }) {
  const [amount, setAmount] = React.useState(String(initialAmount));

  const slots = useSlotsWithIngredients();
  if (!slots) {
    return null;
  }

  function handleSubmit() {
    onSubmit(Number(amount));
    onClose();
  }

  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }} key="qty">
          <BlockFormInput
            {...inputProps}
            label="Dispense Quantity"
            onValue={setAmount}
            value={amount}
          />
        </View>
      ),
    ],
  });
  return (
    <React.Fragment>
      <Subtitle title={ingredientName} />
      {inputs}
      <Button
        title="remove fill"
        type="outline"
        onPress={() => {
          onSubmit(0);
          onClose();
        }}
      />

      <Button title="submit" onPress={handleSubmit} />
    </React.Fragment>
  );
}

function useSetFillPopover({ fill, fills, onFills }) {
  const initialAmount = fill.amount;
  const { onPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <EditFillForm
            onClose={onClose}
            onSubmit={amount => {
              if (amount === 0) {
                onFills(fills.filter(f => f.slotId !== fill.slotId));
                return;
              }
              onFills(
                fills.map(f => {
                  if (f.slotId === fill.slotId) {
                    return { ...f, amount };
                  }
                  return f;
                }),
              );
            }}
            initialAmount={initialAmount}
            ingredientName={fill.ingredientName}
          />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  function onFillPopover() {
    onPopover();
  }
  return onFillPopover;
}

function FillText({ children, color }) {
  return (
    <Text
      style={{
        ...primaryFontFace,
        color: color || '#111',
        fontSize: 16,
      }}
    >
      {children}
    </Text>
  );
}

function SetFillButton({ fill, fills, onFills }) {
  const onFillPopover = useSetFillPopover({ fill, fills, onFills });
  return (
    <Button
      type="outline"
      title={`${fill.amount}`}
      disabled={!onFills}
      onPress={onFillPopover}
      size="small"
    />
  );
}
export default function FillList({ fills, inventoryIngredients, onFills }) {
  if (!fills) {
    return null;
  }
  return (
    fills &&
    fills.map((fill, fillIndex) => {
      const inv =
        inventoryIngredients && inventoryIngredients[fill.ingredientId];
      let fillTextColor = Tag.positiveColor;
      if (!inv || !inv.settings) {
      } else if (inv.settings.disabledMode === 'hard') {
        fillTextColor = '#111';
      } else if (inv.settings.disabledMode) {
        fillTextColor = Tag.negativeColor;
      } else if (inv.estimatedRemaining < fill.amount) {
        fillTextColor = Tag.negativeColor;
      }
      return (
        <View
          key={fillIndex}
          style={{ flexDirection: 'row', marginVertical: 6 }}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {inv && inv.Ingredient && inv.Ingredient.Image && (
              <AirtableImage
                image={inv.Ingredient.Image}
                style={{ width: 50, height: 50 }}
              />
            )}
            <View style={{ flex: 1 }}>
              <FillText color={fillTextColor}>{fill.ingredientName}</FillText>
              {inv && (
                <Text
                  style={{
                    color: '#333',
                    ...primaryFontFace,
                  }}
                >
                  {inv.estimatedRemaining} shots remaining
                </Text>
              )}
            </View>

            <SetFillButton fill={fill} fills={fills} onFills={onFills} />
          </View>
        </View>
      );
    })
  );
}
