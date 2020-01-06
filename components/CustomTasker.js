import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useCloud } from '../cloud-core/KiteReact';
import Row from './Row';
import TaskInfo from './TaskInfo';
import useOrderInfoPopover from './useOrderInfoPopover';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import FillList from './FillList';
import cuid from 'cuid';
import Subtitle from './Subtitle';
import { useCompanyConfig } from '../ono-cloud/OnoKitchen';
import AirtableImage from './AirtableImage';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import { primaryFontFace } from './Styles';
import useAsyncStorage, {
  isStateUnloaded,
} from '../components/useAsyncStorage';
import useKeyboardPopover from './useKeyboardPopover';
import { Spacing, Button, Stack, MultiSelect } from '../dash-ui';

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

function AddFillForm({ onSubmit, onClose }) {
  const [system, setSystem] = React.useState(0);
  const [amount, setAmount] = React.useState(0);
  const [slot, setSlot] = React.useState(0);

  const slots = useSlotsWithIngredients();
  if (!slots) {
    return null;
  }

  // const { inputs } = useFocus({
  //   onSubmit: handleSubmit,
  //   inputRenderers: [
  //     inputProps => (
  //       <View style={{ marginVertical: 10 }}>
  //         <MultiSelect
  //           value={system}
  //           onValue={setSystem}
  //           options={[
  //             { name: 'Granules', value: 0 },
  //             { name: 'Piston', value: 1 },
  //             { name: 'Frozen', value: 2 },
  //             { name: 'Powder', value: 3 },
  //             { name: 'Beverage', value: 4 },
  //           ]}
  //         />
  //       </View>
  //     ),
  //     inputProps => (
  //       <View style={{ flexDirection: 'row', marginVertical: 10 }}>
  //         <BlockFormInput
  //           {...inputProps}
  //           label="Dispense Quantity"
  //           onValue={setAmount}
  //           value={amount}
  //         />
  //       </View>
  //     ),
  //     inputProps => (
  //       <View style={{ flexDirection: 'row', marginVertical: 10 }}>
  //         <BlockFormInput
  //           {...inputProps}
  //           label="Dispense Slot"
  //           onValue={setSlot}
  //           value={slot}
  //         />
  //       </View>
  //     ),
  //   ],
  // });

  return (
    <ScrollView style={{ height: 650 }}>
      {slots.map(slot => (
        <View style={{}}>
          <TouchableOpacity
            onPress={() => {
              onSubmit({
                amount: 1,
                amountVolumeRatio: slot.Ingredient['ShotSize(ml)'],
                ingredientId: slot.Ingredient.id,
                ingredientName: slot.Ingredient.Name,
                slotId: slot.id,
                systemId: slot.KitchenSystem.id,
                systemName: slot.KitchenSystem.Name,
                slot: slot.Slot,
                system: slot.KitchenSystem.FillSystemID,
                index: slot._index,
                invalid: null,
              });
              onClose();
            }}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <AirtableImage
              style={{ width: 100, height: 100 }}
              image={slot.Ingredient.Image}
            />
            <Text
              style={{
                flex: 1,
                ...primaryFontFace,

                color: '#111',
                fontSize: 22,
              }}
            >
              {slot.Ingredient.Name}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

function useFillAddPopover({ onAddFill }) {
  const { onPopover } = useKeyboardPopover(({ onClose }) => {
    return <AddFillForm onClose={onClose} onSubmit={onAddFill} />;
  });
  return onPopover;
}
function usePutTransactionValue(docName) {
  const cloud = useCloud();
  const doc = cloud.get(docName);
  return doc.putTransactionValue;
}

function BlendProfileForm({ onClose, onBlendProfile, blendProfileId }) {
  const config = useCompanyConfig();
  const allProfiles = (config && config.baseTables.BlendProfiles) || {};
  return (
    <ScrollView style={{ height: 650 }}>
      {Object.values(allProfiles).map(profile => {
        if (!profile.Name) {
          return null;
        }
        return (
          <TouchableOpacity
            onPress={() => {
              onBlendProfile(profile);
              onClose();
            }}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text
              style={{
                padding: 16,
                flex: 1,
                ...primaryFontFace,
                color: blendProfileId === profile.id ? '#111' : '#444',
                fontSize: 22,
              }}
            >
              {profile.Name} (
              {((profile.Timer1 || 0) +
                (profile.Timer2 || 0) +
                (profile.Timer3 || 0) +
                (profile.Timer4 || 0)) /
                1000}{' '}
              sec)
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
function useBlendProfilePopover({ blendProfileId, onBlendProfile }) {
  const { onPopover } = useKeyboardPopover(({ onClose }) => {
    return (
      <BlendProfileForm
        onClose={onClose}
        onBlendProfile={onBlendProfile}
        blendProfileId={blendProfileId}
      />
    );
  });
  return onPopover;
}
export default function CustomTasker() {
  const [savedTask, setSavedTask] = useAsyncStorage('OnoSavedCustomBlend', {
    orderName: 'Tester O.',
    blendName: 'Test Blend',
    blendColor: 'blue',
    deliveryMode: 'deliver',
    skipBlend: null,
    blendProfileId: null,
    blendProfileName: 'None',
    blendProfile: null,
    fills: [],
  });
  const { orderName, blendName, deliveryMode, skipBlend, fills } = savedTask;
  const onBlendProfile = useBlendProfilePopover({
    blendProfileId: savedTask.blendProfileId,
    onBlendProfile: blendProfile => {
      setSavedTask({
        ...savedTask,
        blendProfile,
        blendProfileName: blendProfile.Name,
        blendProfileId: blendProfile.id,
      });
    },
  });
  const openOrderInfo = useOrderInfoPopover({
    orderName,
    blendName,
    onOrderInfo: orderInfo => {
      setSavedTask({ ...savedTask, ...orderInfo });
    },
  });

  const openAddFill = useFillAddPopover({
    onAddFill: fill => {
      setSavedTask({
        ...savedTask,
        fills: [...(savedTask.fills || []), fill],
      });
    },
  });
  const restaurantDispatch = usePutTransactionValue('RestaurantActions');

  if (isStateUnloaded(savedTask)) {
    return null;
  }

  return (
    <Row title="custom blend task">
      <Spacing>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, margin: 8 }}>
            <TaskInfo task={{ name: orderName, blendName: blendName }} />
            <Button title="set order info" outline onPress={openOrderInfo} />
            <Spacing top={8}>
              <Button
                title={`blend profile: ${savedTask.blendProfileName || 'None'}`}
                outline
                onPress={onBlendProfile}
              />
            </Spacing>
          </View>
          <View style={{ flex: 1, margin: 8 }}>
            <View style={{ flex: 1, padding: 0 }}>
              <Subtitle title="custom fills" />
              <FillList
                fills={fills}
                onFills={fills => setSavedTask({ ...savedTask, fills })}
              />
            </View>
            <Button title="add fill" secondary onPress={openAddFill} />
          </View>
        </View>
        <Stack inline>
          <MultiSelect
            value={deliveryMode}
            onValue={deliveryMode =>
              setSavedTask({
                ...savedTask,
                deliveryMode,
                skipBlend:
                  deliveryMode !== 'deliver' && !savedTask.skipBlend
                    ? true
                    : savedTask.skipBlend,
              })
            }
            options={[
              { name: 'deliver', value: 'deliver' },
              { name: 'drop in trash', value: 'ditch' },
              { name: 'drop after filling', value: 'drop' },
            ]}
          />
          <MultiSelect
            value={skipBlend || false}
            onValue={skipBlend =>
              setSavedTask({
                ...savedTask,
                skipBlend,
                deliveryMode:
                  savedTask.deliveryMode !== 'deliver' && !skipBlend
                    ? 'deliver'
                    : savedTask.deliveryMode,
              })
            }
            options={[
              { name: 'blend', value: false },
              { name: 'skip blend', value: true },
            ]}
          />
        </Stack>
        <Spacing value={8}>
          <Button
            title="queue task"
            onPress={() => {
              restaurantDispatch({
                type: 'QueueTasks',
                tasks: [
                  {
                    id: cuid(),
                    customTask: true,
                    name: savedTask.orderName, // lame
                    blendName: savedTask.blendName, // name
                    ...savedTask,
                  },
                ],
              })
                .then(() => {})
                .catch(console.error);
            }}
          />
        </Spacing>
      </Spacing>
    </Row>
  );
}
