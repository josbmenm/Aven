import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import { View, Text, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import { Easing } from 'react-native-reanimated';
import KitchenCommands from '../logic/KitchenCommands';

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
import { useRestaurantState } from '../ono-cloud/Kitchen';

function TaskInfoText({ taskState }) {
  if (!taskState) {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
        <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
          Unknown Task
        </Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
      <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
        {taskState.name}
      </Text>
      <Text style={{ fontSize: 24, ...primaryFontFace, color: '#282828' }}>
        {taskState.blendName}
      </Text>
    </View>
  );
}

function BayInfo({ bayState, name, dispatch, bayId }) {
  let content = <Text style={{ fontSize: 24 }}>Empty</Text>;
  if (bayState) {
    content = (
      <View style={{ flex: 1 }}>
        <TaskInfoText taskState={bayState.task} />
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
  const hasFill = !!restaurantState.fill;
  const order = hasFill && restaurantState.fill.task;
  return (
    <Row title="Fill System">
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            {order && <TaskInfoText taskState={order} />}
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
  return <TaskInfoText taskState={state.task} />;
}

function DeliverySystemRow({ state }) {
  if (!state) {
    return <Text>Empty</Text>;
  }
  return <TaskInfoText taskState={state.task} />;
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
  const [restaurantState, dispatch] = useRestaurantState();
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
