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
import Subtitle from '../components/Subtitle';
import Row from '../components/Row';
import {
  proseFontFace,
  primaryFontFace,
  monsterra80,
} from '../components/Styles';
import RestaurantReducer from '../logic/RestaurantReducer';
import useAsyncError from '../react-utils/useAsyncError';
import ControlPanel from './ControlPanel';

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
            <Text key={i}>
              {fill.system}.{fill.slot} x {fill.amount}
            </Text>
          ))}
      </View>
      <View style={{ flex: 1 }}>
        <Subtitle title="Completed Fills" />
        {state.fillsCompleted &&
          state.fillsCompleted.map((fill, i) => (
            <Text key={i}>
              {fill.system}.{fill.slot} x {fill.amount}
            </Text>
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
