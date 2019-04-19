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
import KitchenCommands from '../../logic/KitchenCommands';
import KitchenHistory from '../../components/KitchenHistory';
import {
  CardReaderLog,
  useCardReader,
  useCardPaymentCapture,
  disconnectReader,
  clearReaderLog,
} from '../CardReader';
import OnoCloud from '../OnoCloud';
import useCloud from '../../cloud-core/useCloud';
import useCloudReducer from '../../cloud-core/useCloudReducer';
import useObservable from '../../cloud-core/useObservable';
import RowSection from '../../components/RowSection';
import TextRow from '../../components/TextRow';
import BitRow from '../../components/BitRow';
import Row from '../../components/Row';
import BlockFormInput from '../../components/BlockFormInput';

import { usePopover } from '../../views/Popover';
import { rowStyle, prettyShadow } from '../../components/Styles';
import KeyboardPopover from '../../components/KeyboardPopover';
import RestaurantReducer from '../../logic/RestaurantReducer';
import useFocus from '../../navigation-hooks/useFocus';
import kuid from 'kuid';

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
    { system: 5, slot: 0, amount: 1 },
    { system: 3, slot: 0, amount: 2 },
    { system: 3, slot: 2, amount: 3 },
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
            <OrderInfoText
              orderState={{ name: orderName, blendName: orderBlendName }}
            />
            <Button title="set order info" secondary onPress={openOrderInfo} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 0 }}>
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
        <Button
          title="place order"
          onPress={() => {
            restaurantDispatch({
              type: 'PlaceOrder',
              order: {
                id: kuid(),
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

function OrderInfoText({ orderState }) {
  return (
    <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
      <Text style={{ fontSize: 32 }}>{orderState.name}</Text>
      <Text style={{ fontSize: 24, color: '#333' }}>
        {orderState.blendName}
      </Text>
    </View>
  );
}

function OrderState({ orderState }) {
  return <Text>{JSON.stringify(orderState)}</Text>;
}
function OrderQueueRow({ onCancel, orderState }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'stretch',
      }}
    >
      <OrderInfoText orderState={orderState} />
      <Text style={{ alignSelf: 'center', margin: 10 }}>
        {orderState.fills.length} fills
      </Text>
      <Button onPress={onCancel} title="Cancel" />
    </View>
  );
}

function OrderQueue({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  return (
    <RowSection title="Order Queue">
      {restaurantState.queue &&
        restaurantState.queue.map(orderState => (
          <OrderQueueRow
            key={orderState.id}
            orderState={orderState}
            onCancel={() => {
              dispatch({ type: 'CancelOrder', id: orderState.id });
            }}
          />
        ))}
    </RowSection>
  );
}

function BayInfo({ bayState, name }) {
  let content = <Text style={{ fontSize: 24 }}>Empty</Text>;
  if (bayState) {
    content = (
      <View style={{ flex: 1 }}>
        <OrderInfoText orderState={bayState.order} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>{name}</Text>
      {content}
      <Button title="Clear" onPress={() => {}} disabled />
    </View>
  );
}

function DeliveryBayRow({ restaurantState, dispatch }) {
  return (
    <Row title={`Delivery Bays`}>
      <BayInfo
        bayState={restaurantState.deliveryA}
        name="Left"
        dispatch={dispatch}
      />
      <BayInfo
        bayState={restaurantState.deliveryB}
        name="Right"
        dispatch={dispatch}
      />
    </Row>
  );
}

function RestaurantStateList({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  return (
    <RowSection>
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
      <DeliveryBayRow restaurantState={restaurantState} dispatch={dispatch} />
    </RowSection>
  );
}

function StatusPuck({ status }) {
  let statusColor = null;
  switch (status) {
    case 'fault': {
      statusColor = '#a33';
      break;
    }
    case 'alarm': {
      statusColor = 'yellow';
      break;
    }
    case 'ready': {
      statusColor = '#2a4';
      break;
    }
    case 'disconnected':
    default: {
      statusColor = '#888';
      break;
    }
  }
  return (
    <View
      style={{
        margin: 10,
        backgroundColor: statusColor,
        width: 50,
        height: 100,
        borderRadius: 14,
      }}
    />
  );
}

function ControlPanel({ restaurantState, restaurantDispatch }) {
  const isConnected = useObservable(OnoCloud.isConnected);
  const kitchenState = useCloudValue('KitchenState');
  const kitchenConfig = useCloudValue('KitchenConfig');
  const isPLCConnected = React.useMemo(
    () => kitchenState && kitchenState.isPLCConnected,
    [kitchenState],
  );
  const sequencerNames =
    kitchenConfig &&
    Object.keys(kitchenConfig.subsystems)
      .map(k => kitchenConfig.subsystems[k])
      .filter(subsystem => subsystem.hasSequencer)
      .map(s => s.name);
  console.log(kitchenState, kitchenConfig, sequencerNames);
  const errorHandler = useAsyncError();
  let status = 'ready';
  let message = 'Ready and Idle';
  let subMessage = null;

  if (!isConnected) {
    status = 'disconnected';
    message = 'App disconnected from server..';
  } else if (!isPLCConnected) {
    status = 'disconnected';
    message = 'Server disconnected from machine..';
  } else {
    sequencerNames &&
      sequencerNames.forEach(systemName => {
        if (kitchenState[`${systemName}_NoFaults_READ`] === false) {
          if (status !== 'fault') {
            status = 'fault';
            message = `Faulted. ${systemName}`;
          } else {
            message += `, ${systemName}`;
          }
        }
      });
  }
  return (
    <View
      style={{
        ...prettyShadow,
        height: 120,
        alignSelf: 'stretch',
        backgroundColor: '#fff8ee',
        flexDirection: 'row',
      }}
    >
      <StatusPuck status={status} />

      <View style={{ flex: 1, padding: 16 }}>
        {message && <Text style={{ fontSize: 32 }}>{message}</Text>}
        {subMessage && <Text>{subMessage}</Text>}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {restaurantState && (
          <View style={{}}>
            <Text style={{ textAlign: 'center', paddingTop: 8 }}>
              {restaurantState.isAutoRunning ? 'Auto: Running' : 'Auto: Paused'}
            </Text>
            <Button
              title={restaurantState.isAutoRunning ? 'Pause' : 'Start'}
              onPress={() => {
                if (restaurantState.isAutoRunning) {
                  errorHandler(restaurantDispatch({ type: 'PauseAutorun' }));
                } else {
                  errorHandler(restaurantDispatch({ type: 'StartAutorun' }));
                }
              }}
              secondary
            />
          </View>
        )}
        {restaurantState && !restaurantState.isAutoRunning && (
          <Button title="Step" onPress={() => {}} secondary />
        )}
        <Button
          title="STOP"
          onPress={() => {
            // todo
          }}
        />
      </View>
    </View>
  );
}

function useAsyncError() {
  const [error, setError] = useState(null);
  if (error) {
    throw error;
  }
  function handler(promise) {
    promise.then().catch(error => {
      setError(error);
    });
  }
  return handler;
}

function ManualActionsSection() {
  const cloud = useCloud();
  const handleErrors = useAsyncError();
  const kitchenState = useCloudValue('KitchenState');
  const fillParams = {
    amount: 2,
    system: 3,
    slot: 1,
  };
  return (
    <RowSection title="Manual Actions">
      <Button
        title="home system"
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'Home',
            }),
          );
        }}
      />
      <Button
        title="grab new cup"
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'GetCup',
            }),
          );
        }}
      />
      <Button
        title="drop cup"
        disabled={!KitchenCommands.DropCup.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'DropCup',
            }),
          );
        }}
      />
      <Button
        title="dispense 2 cocoa powder"
        disabled={
          !KitchenCommands.PositionAndDispenseAmount.checkReady(
            kitchenState,
            fillParams,
          )
        }
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'PositionAndDispenseAmount',
              params: fillParams,
            }),
          );
        }}
      />
      <Button
        title="deliver cup"
        disabled={!KitchenCommands.DeliverCupToBlender.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'DeliverCupToBlender',
            }),
          );
        }}
      />
    </RowSection>
  );
}

export default function SequencingDebugScreen(props) {
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActions',
    'RestaurantReducer',
    RestaurantReducer,
    {},
  );
  return (
    <TwoPanePage
      {...props}
      title="Kitchen Sequencer"
      icon="🧭"
      afterSide={
        <ControlPanel
          restaurantState={restaurantState}
          restaurantDispatch={dispatch}
        />
      }
      side={
        <KitchenHistory restaurantState={restaurantState} dispatch={dispatch} />
      }
    >
      <OrderQueue restaurantState={restaurantState} dispatch={dispatch} />
      <RestaurantStateList
        restaurantState={restaurantState}
        dispatch={dispatch}
      />
      <RowSection>
        <AdHocOrderRow />
      </RowSection>
      <ManualActionsSection />
    </TwoPanePage>
  );
}

SequencingDebugScreen.navigationOptions = TwoPanePage.navigationOptions;
