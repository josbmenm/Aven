import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Button from './Button';
import MultiSelect from './MultiSelect';
import { Easing } from 'react-native-reanimated';
import { useCloud } from '../cloud-core/KiteReact';
import Row from './Row';
import TaskInfo from './TaskInfo';
import useOrderInfoPopover from './useOrderInfoPopover';
import BlockFormInput from './BlockFormInput';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import useFocus from '../navigation-hooks/useFocus';
import cuid from 'cuid';
import Subtitle from './Subtitle';

function AddFillForm({ onSubmit }) {
  const [system, setSystem] = React.useState(0);
  const [amount, setAmount] = React.useState(0);
  const [slot, setSlot] = React.useState(0);
  function handleSubmit() {
    // amount: ing.amount,
    // amountVolumeRatio: ing.amountVolumeRatio,
    // ingredientId: ing.id,
    // ingredientName: ing.Name,
    // ingredientColor: ing.Color,
    // ingredientIcon: ing.Icon,
    // slotId: kitchenSlotId,
    // systemId: kitchenSystemId,
    // slot: kitchenSlot.Slot,
    // system: kitchenSystem.FillSystemID,
    // index: kitchenSlot._index,
    // invalid: null,

    onSubmit({
      system,
      amount,
      slot,
    });
  }
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      inputProps => (
        <View style={{ marginVertical: 10 }}>
          <MultiSelect
            value={system}
            onValue={setSystem}
            options={[
              { name: 'Granules', value: 0 },
              { name: 'Piston', value: 1 },
              { name: 'Frozen', value: 2 },
              { name: 'Powder', value: 3 },
              { name: 'Beverage', value: 4 },
            ]}
          />
        </View>
      ),
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <BlockFormInput
            {...inputProps}
            label="Dispense Quantity"
            onValue={setAmount}
            value={amount}
          />
        </View>
      ),
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <BlockFormInput
            {...inputProps}
            label="Dispense Slot"
            onValue={setSlot}
            value={slot}
          />
        </View>
      ),
    ],
  });

  return (
    <React.Fragment>
      {inputs}
      <Button onPress={handleSubmit} title="add fill" />
    </React.Fragment>
  );
}

function useFillAddPopover({ onAddFill }) {
  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <AddFillForm onClose={onClose} onSubmit={onAddFill} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return onPopover;
}
function usePutTransactionValue(docName) {
  const cloud = useCloud();
  const doc = cloud.get(docName);
  return doc.putTransactionValue;
}

export default function CustomTasker() {
  const [orderName, setOrderName] = React.useState('OnoInternal');
  const [orderBlendName, setOrderBlendName] = React.useState('Test Blend');
  const [deliveryMode, setDeliveryMode] = React.useState('deliver');
  const [skipBlend, setSkipBlend] = React.useState(null);

  const [fills, setFills] = React.useState([]);

  const openOrderInfo = useOrderInfoPopover({
    orderName,
    orderBlendName,
    setOrderName,
    setOrderBlendName,
  });
  function onAddFill(fill) {
    setFills([...fills, fill]);
  }
  const openAddFill = useFillAddPopover({ onAddFill });
  const restaurantDispatch = usePutTransactionValue('RestaurantActions');

  return (
    <Row title="custom order">
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <TaskInfo task={{ name: orderName, blendName: orderBlendName }} />
            <Button
              title="set order info"
              type="outline"
              onPress={openOrderInfo}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 0 }}>
              <Subtitle title="custom ingredients" />
              {fills.map((fill, fillIndex) => (
                <View key={fillIndex} style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text
                      style={{ fontSize: 16, padding: 5, paddingVertical: 5 }}
                    >
                      system: {fill.system}
                    </Text>
                    <Text
                      style={{ fontSize: 16, padding: 5, paddingVertical: 5 }}
                    >
                      slot: {fill.slot}
                    </Text>
                    <Text
                      style={{ fontSize: 16, padding: 5, paddingVertical: 5 }}
                    >
                      qty: {fill.amount}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const newFills = [...fills];
                      newFills.splice(fillIndex, 1);
                      setFills(newFills);
                    }}
                    hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
                  >
                    <Text>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <Button title="add fill" secondary onPress={openAddFill} />
          </View>
        </View>

        <MultiSelect
          value={deliveryMode}
          onValue={setDeliveryMode}
          options={[
            { name: 'deliver', value: 'deliver' },
            { name: 'drop in trash', value: 'ditch' },
            { name: 'drop when done', value: 'drop' },
          ]}
        />

        <MultiSelect
          value={skipBlend}
          onValue={setSkipBlend}
          options={[
            { name: 'blend', value: null },
            { name: 'skip blend', value: true },
          ]}
        />

        <Button
          title="queue task"
          onPress={() => {
            restaurantDispatch({
              type: 'QueueTasks',
              tasks: [
                {
                  id: cuid(),
                  name: orderName,
                  blendName: orderBlendName,
                  skipBlend,
                  deliveryMode,
                  fills,
                },
              ],
            })
              .then(() => {
                console.log('order placed!');
              })
              .catch(console.error);
          }}
        />
      </View>
    </Row>
  );
}
