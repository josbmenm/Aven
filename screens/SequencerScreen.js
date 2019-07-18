import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import { View, Text, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import { Easing } from 'react-native-reanimated';
import KitchenCommands from '../logic/KitchenCommands';
import {
  useCloud,
  useCloudReducer,
  useCloudValue,
} from '../cloud-core/KiteReact';
import RowSection from '../components/RowSection';
import Row from '../components/Row';
import BlockFormInput from '../components/BlockFormInput';
import { usePopover } from '../views/Popover';
import {
  titleStyle,
  proseFontFace,
  primaryFontFace,
  monsterra80,
} from '../components/Styles';
import KeyboardPopover from '../components/KeyboardPopover';
import RestaurantReducer from '../logic/RestaurantReducer';
import useFocus from '../navigation-hooks/useFocus';
import useAsyncError from '../react-utils/useAsyncError';
import ControlPanel from './ControlPanel';
import cuid from 'cuid';

function Subtitle({ title }) {
  return (
    <Text style={{ ...titleStyle, opacity: 0.8, fontSize: 20 }}>{title}</Text>
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

function AdHocOrderRow() {
  const [orderName, setOrderName] = React.useState('Lucy');
  const [orderBlendName, setOrderBlendName] = React.useState(
    'Mango and Tumeric',
  );

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
        <Button
          title="place order"
          onPress={() => {
            restaurantDispatch({
              type: 'QueueOrderItem',
              item: {
                id: cuid(),
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
        restaurantState.queue.filter(Boolean).map(orderState => (
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

function BayInfo({ bayState, name, dispatch, bayId }) {
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
      <Button
        title="Clear"
        onPress={() => {
          dispatch({ type: 'ClearDeliveryBay', bayId });
        }}
        disabled={!bayState}
      />
    </View>
  );
}

function DeliveryBayRow({ restaurantState, dispatch }) {
  return (
    <Row title={`Delivery Bays`}>
      <BayInfo
        bayState={restaurantState.deliveryA}
        bayId="deliveryA"
        name="Left"
        dispatch={dispatch}
      />
      <BayInfo
        bayState={restaurantState.deliveryB}
        bayId="deliveryB"
        name="Right"
        dispatch={dispatch}
      />
    </Row>
  );
}

function FillsDisplay({ state }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1 }}>
        <Subtitle title="Remaining Fills" />
        {state.fillsRemaining &&
          state.fillsRemaining.map((fill, i) => (
            <Text key={i}>{JSON.stringify(fill)}</Text>
          ))}
      </View>
      <View style={{ flex: 1 }}>
        <Subtitle title="Completed Fills" />
        {state.fillsCompleted &&
          state.fillsCompleted.map((fill, i) => (
            <Text key={i}>{JSON.stringify(fill)}</Text>
          ))}
      </View>
    </View>
  );
}

function FillRow({ restaurantState, dispatch }) {
  // return <Text>{JSON.stringify(fillState)}</Text>;
  const hasFill = !!restaurantState.fill;
  const order = hasFill && restaurantState.fill.order;
  return (
    <Row title="Fill System">
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            {order && <OrderInfoText orderState={order} />}
          </View>
          <Button
            disabled={!hasFill}
            title="Drop"
            onPress={() => {
              dispatch({ type: 'RequestFillDrop' });
            }}
          />
        </View>
        {restaurantState.fill && <FillsDisplay state={restaurantState.fill} />}
      </View>
    </Row>
  );
}
function BlendRow({ state }) {
  if (state === 'dirty') {
    return <Text>Dirty Blender</Text>;
  }
  if (!state) {
    return <Text>Empty</Text>;
  }
  return <OrderInfoText orderState={state.order} />;
}

function DeliverySystemRow({ state }) {
  if (!state) {
    return <Text>Empty</Text>;
  }
  return <OrderInfoText orderState={state.order} />;
}

function RestaurantStateList({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  return (
    <RowSection>
      <FillRow restaurantState={restaurantState} dispatch={dispatch} />
      <Row title="Blend System">
        <BlendRow state={restaurantState.blend} />
      </Row>
      <Row title="Delivery System">
        <DeliverySystemRow state={restaurantState.delivery} />
      </Row>
      <DeliveryBayRow restaurantState={restaurantState} dispatch={dispatch} />
    </RowSection>
  );
}

function QuickOrderSection() {
  return (
    <RowSection title="Quick Order">
      <Button title="Hello" />
    </RowSection>
  );
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
        title="pass to blender"
        disabled={!KitchenCommands.PassToBlender.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'PassToBlender',
            }),
          );
        }}
      />
      <Button
        title="blend"
        disabled={!KitchenCommands.Blend.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'Blend',
            }),
          );
        }}
      />
      <Button
        title="pass to delivery"
        disabled={!KitchenCommands.PassToDelivery.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'PassToDelivery',
            }),
          );
        }}
      />
      <Button
        title="pass to delivery without clean"
        disabled={
          !KitchenCommands.PassToDeliveryWithoutClean.checkReady(kitchenState)
        }
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'PassToDeliveryWithoutClean',
            }),
          );
        }}
      />
      <Button
        title="clean"
        disabled={!KitchenCommands.Clean.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'Clean',
            }),
          );
        }}
      />
    </RowSection>
  );
}

function OrdersScreen({ restaurantState, dispatch }) {
  return (
    <React.Fragment>
      <RestaurantStateList
        restaurantState={restaurantState}
        dispatch={dispatch}
      />
      <RowSection>
        <AdHocOrderRow />
      </RowSection>
      <Button
        secondary
        title="Wipe Restaurant State"
        onPress={() => {
          dispatch({ type: 'WipeState' });
        }}
      />
    </React.Fragment>
  );
}

export default function SequencerScreen(props) {
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActions',
    RestaurantReducer,
  );
  return (
    <TwoPanePage
      {...props}
      title="Sequencer"
      icon="🚦"
      footer={
        <ControlPanel
          restaurantState={restaurantState}
          restaurantDispatch={dispatch}
        />
      }
      side={
        <OrdersScreen restaurantState={restaurantState} dispatch={dispatch} />
      }
    >
      {null}
    </TwoPanePage>
  );
}

SequencerScreen.navigationOptions = TwoPanePage.navigationOptions;
