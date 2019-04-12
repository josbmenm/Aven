import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
} from 'react-native';
import JSONView from '../../debug-views/JSONView';
import TwoPanePage from '../../components/TwoPanePage';
import useCloudValue from '../../cloud-core/useCloudValue';
import Button from '../../components/Button';
import { Easing } from 'react-native-reanimated';
import {
  CardReaderLog,
  useCardReader,
  useCardPaymentCapture,
  disconnectReader,
  clearReaderLog,
} from '../CardReader';
import useCloud from '../../cloud-core/useCloud';
import useCloudReducer from '../../cloud-core/useCloudReducer';
import useObservable from '../../cloud-core/useObservable';
import RowSection from '../../components/RowSection';
import TextRow from '../../components/TextRow';
import BitRow from '../../components/BitRow';
import Row from '../../components/Row';
import BlockFormInput from '../../components/BlockFormInput';

import { usePopover } from '../../views/Popover';
import { rowStyle } from '../../components/Styles';
import KeyboardPopover from '../../components/KeyboardPopover';
import RestaurantReducer from '../../logic/RestaurantReducer';
import useFocus from '../../navigation-hooks/useFocus';

function ObservableBitRow({ value, title }) {
  const currentValue = useObservable(value);
  return <BitRow value={currentValue} title={title} />;
}

function ObservableJSONRow({ value, title }) {
  const currentValue = useObservable(value);
  return <TextRow text={JSON.stringify(currentValue)} title={title} />;
}

function AddFillForm({ onSubmit }) {
  const [system, setSystem] = useState(0);
  const [amount, setAmount] = useState(0);
  const [slot, setSlot] = useState(0);
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
            label="Dispense Amount"
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
  const [orderName, setOrderName] = useState(initialInfo.orderName);
  const [orderBlendName, setOrderBlendName] = useState(
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
function usePutTransaction(docName) {
  const cloud = useCloud();
  const doc = cloud.get(docName);
  return doc.putTransaction;
}

function AdHocOrderRow() {
  const [orderName, setOrderName] = useState('Lucy');
  const [orderBlendName, setOrderBlendName] = useState('Mango and Tumeric');

  const [fills, setFills] = useState([
    { system: 1, slot: 0, amount: 3 },
    { system: 1, slot: 1, amount: 3 },
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
  const restaurantDispatch = usePutTransaction('RestaurantActions');

  return (
    <Row title="Ad-Hoc Order">
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 30 }}>
              <Text style={{ fontSize: 24 }}>Name: {orderName}</Text>
              <Text style={{ fontSize: 24 }}>Blend Name: {orderBlendName}</Text>
            </View>
            <Button title="set order info" secondary onPress={openOrderInfo} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 30 }}>
              {fills.map((fill, fillIndex) => (
                <View key={fillIndex} style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text
                      style={{ fontSize: 24, padding: 5, paddingVertical: 10 }}
                    >
                      system: {fill.system}
                    </Text>
                    <Text
                      style={{ fontSize: 24, padding: 5, paddingVertical: 10 }}
                    >
                      slot: {fill.slot}
                    </Text>
                    <Text
                      style={{ fontSize: 24, padding: 5, paddingVertical: 10 }}
                    >
                      amount: {fill.amount}
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
        <Button
          title="place order"
          onPress={() => {
            restaurantDispatch({
              type: 'PlaceOrder',
              order: {
                name: orderName,
                blendName: orderBlendName,
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

function OrderState({ orderState }) {
  return <Text>{JSON.stringify(orderState)}</Text>;
}

function RestaurantStateList({ restaurantState }) {
  if (!restaurantState) {
    return null;
  }
  return (
    <RowSection>
      <Row title="Order Queue">
        {restaurantState.queue &&
          restaurantState.queue.map(orderState => (
            <OrderState orderState={orderState} />
          ))}
      </Row>
      <Row title="Fill System">
        {restaurantState.filling && (
          <OrderState orderState={restaurantState.filling} />
        )}
      </Row>
      <Row title="Blend System">
        {restaurantState.blending && (
          <OrderState orderState={restaurantState.blending} />
        )}
      </Row>
      <Row title="Dispense System">
        {restaurantState.delivering && (
          <OrderState orderState={restaurantState.delivering} />
        )}
      </Row>
      <Row title="Delivery A">
        {restaurantState.deliveryA && (
          <OrderState orderState={restaurantState.deliveryA} />
        )}
      </Row>
      <Row title="Delivery B">
        {restaurantState.deliveryB && (
          <OrderState orderState={restaurantState.deliveryB} />
        )}
      </Row>
    </RowSection>
  );
}

function Foo() {
  const v = useCloudValue('RestaurantActions');
  console.log('vvvv', v);
  return <TextRow text={JSON.stringify(v)} title="RestaurantActions" />;
}

export default function SequencingDebugScreen(props) {
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActions',
    'RestaurantReducer',
    RestaurantReducer,
    {},
  );
  console.log('fml', restaurantState);
  // const restaurantState = useCloudValue('RestaurantActions^RestaurantReducer');
  return (
    <TwoPanePage {...props} title="Kitchen Sequencer" icon="🧭">
      <RestaurantStateList restaurantState={restaurantState} />
      <Foo />

      <RowSection>
        <AdHocOrderRow />
        <Button title="Test DispenseCup" onPress={() => {}} />
      </RowSection>
    </TwoPanePage>
  );
}

SequencingDebugScreen.navigationOptions = TwoPanePage.navigationOptions;
