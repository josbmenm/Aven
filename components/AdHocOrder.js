import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import { Easing } from 'react-native-reanimated';
import { useCloud } from '../cloud-core/KiteReact';
import Row from '../components/Row';
import BlockFormInput from '../components/BlockFormInput';
import { usePopover } from '../views/Popover';
import KeyboardPopover from '../components/KeyboardPopover';
import useFocus from '../navigation-hooks/useFocus';
import cuid from 'cuid';
import Subtitle from '../components/Subtitle';
import {
  proseFontFace,
  primaryFontFace,
  monsterra80,
} from '../components/Styles';

function MultiSelect({ options, value, onValue }) {
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
      {options.map(opt => {
        return (
          <Button
            type={value === opt.value ? 'solid' : 'outline'}
            title={opt.name}
            onPress={() => {
              onValue(opt.value);
            }}
          />
        );
      })}
    </View>
  );
}

function OrderInfoText({ orderState }) {
  if (!orderState) {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
        <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
          Unknown Order
        </Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
      <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
        {orderState.name}
      </Text>
      <Text style={{ fontSize: 24, ...primaryFontFace, color: '#282828' }}>
        {orderState.blendName}
      </Text>
    </View>
  );
}

function AddFillForm({ onSubmit }) {
  const [system, setSystem] = React.useState(0);
  const [amount, setAmount] = React.useState(0);
  const [slot, setSlot] = React.useState(0);
  function handleSubmit() {
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
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <BlockFormInput
            {...inputProps}
            label="Dispense System"
            onValue={setSystem}
            value={system}
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

function SetInfoForm({ onClose, initialInfo, onSubmit }) {
  const [orderName, setOrderName] = React.useState(initialInfo.orderName);
  const [orderBlendName, setOrderBlendName] = React.useState(
    initialInfo.orderBlendName,
  );

  function handleSubmit() {
    onSubmit({ orderName, orderBlendName });
    onClose();
  }

  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <BlockFormInput
            {...inputProps}
            label="Order Name"
            onValue={setOrderName}
            value={orderName}
          />
        </View>
      ),
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <BlockFormInput
            {...inputProps}
            label="Blend Name"
            onValue={setOrderBlendName}
            value={orderBlendName}
          />
        </View>
      ),
    ],
  });

  return (
    <React.Fragment>
      {inputs}
      <Button onPress={handleSubmit} title="set info" />
    </React.Fragment>
  );
}
function useOrderInfoPopover({
  setOrderName,
  setOrderBlendName,
  orderName,
  orderBlendName,
}) {
  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <SetInfoForm
            initialInfo={{ orderName, orderBlendName }}
            onClose={onClose}
            onSubmit={i => {
              setOrderName(i.orderName);
              setOrderBlendName(i.orderBlendName);
            }}
          />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return onPopover;
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

export default function AdHocOrder() {
  const [orderName, setOrderName] = React.useState('Lucy');
  const [orderBlendName, setOrderBlendName] = React.useState(
    'Mango and Tumeric',
  );
  const [deliveryMode, setDeliveryMode] = React.useState('deliver');
  const [skipBlend, setSkipBlend] = React.useState(null);

  const [fills, setFills] = React.useState([
    { system: 3, slot: 0, amount: 2, name: 'Yummy' },
    { system: 3, slot: 2, amount: 3, name: 'Food' },
  ]);

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
    <Row title="Ad-Hoc Order">
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Subtitle title="Order Info" />
            <OrderInfoText
              orderState={{ name: orderName, blendName: orderBlendName }}
            />
            <Button title="set order info" secondary onPress={openOrderInfo} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 0 }}>
              <Subtitle title="Fills" />
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
            { name: 'Deliver', value: 'deliver' },
            { name: 'Drop in trash', value: 'ditch' },
            { name: 'Drop when done', value: 'drop' },
          ]}
        />

        <MultiSelect
          value={skipBlend}
          onValue={setSkipBlend}
          options={[
            { name: 'Blend', value: null },
            { name: 'Skip Blend', value: true },
          ]}
        />

        <Button
          title="place order"
          onPress={() => {
            restaurantDispatch({
              type: 'QueueTask',
              item: {
                id: cuid(),
                name: orderName,
                blendName: orderBlendName,
                skipBlend,
                deliveryMode,
                fills,
              },
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
