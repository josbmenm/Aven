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
import ManualControl from './ManualControl';
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
  let content = null;
  if (bayState) {
    content = (
      <View style={{ flex: 1 }}>
        <TaskInfoText taskState={bayState.task} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Subtitle title={name} />
      {content}
      {/* <Button
        title="Clear"
        onPress={() => {
          dispatch({ type: 'ClearDeliveryBay', bayId });
        }}
        disabled={!bayState}
      /> */}
    </View>
  );
}

function DeliveryBayRow({ restaurantState, dispatch }) {
  return (
    ((restaurantState.deliveryA || restaurantState.deliveryB) && (
      <Row>
        <BayInfo
          bayState={restaurantState.deliveryA}
          bayId="deliveryA"
          name="deliver left"
          dispatch={dispatch}
        />
        <BayInfo
          bayState={restaurantState.deliveryB}
          bayId="deliveryB"
          name="deliver right"
          dispatch={dispatch}
        />
      </Row>
    )) ||
    null
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
  const { task } = restaurantState.fill;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          {task && <TaskInfoText taskState={task} />}
        </View>
        <Button
          title="drop"
          onPress={() => {
            dispatch({ type: 'RequestFillDrop' });
          }}
        />
      </View>
      <FillsDisplay state={restaurantState.fill} />
    </View>
  );
}
function BlendRow({ state }) {
  if (state === 'dirty') {
    return <Text>Dirty Blender</Text>;
  }
  return <TaskInfoText taskState={state.task} />;
}

function DeliverySystemRow({ state }) {
  return <TaskInfoText taskState={state.task} />;
}

function RestaurantStateList({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  const count = restaurantState.queue ? restaurantState.queue.length : 0;
  return (
    <RowSection>
      <Row title={`${count} task${count === 1 ? '' : 's'} in queue`} />
      {restaurantState.fill && (
        <Row title="filling">
          <FillRow restaurantState={restaurantState} dispatch={dispatch} />
        </Row>
      )}
      {restaurantState.blend && (
        <Row title="blender">
          <BlendRow state={restaurantState.blend} />
        </Row>
      )}
      {restaurantState.delivery && (
        <Row title="delivery arm">
          <DeliverySystemRow state={restaurantState.delivery} />
        </Row>
      )}
      <DeliveryBayRow restaurantState={restaurantState} dispatch={dispatch} />
    </RowSection>
  );
}

function ModeView({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  return (
    <View>
      <Button
        title="prime dispensers"
        onPress={() => {
          dispatch({
            type: 'PrimeDispensers',
          });
        }}
      />
      <Button
        title={
          restaurantState.isDryRunning
            ? 'disable DRY RUN mode'
            : 'enable DRY RUN mode'
        }
        onPress={() => {
          dispatch({
            type: 'SetDryMode',
            isDryRunning: !restaurantState.isDryRunning,
          });
        }}
      />
      {restaurantState.manualMode && (
        <ManualControl restaurantState={restaurantState} dispatch={dispatch} />
      )}
    </View>
  );
}

export default function SequencerScreen(props) {
  const [restaurantState, dispatch] = useRestaurantState();
  return (
    <TwoPanePage
      {...props}
      hideBackButton={true}
      footer={
        <ControlPanel
          restaurantState={restaurantState}
          restaurantDispatch={dispatch}
        />
      }
      side={
        <RestaurantStateList
          restaurantState={restaurantState}
          dispatch={dispatch}
        />
      }
    >
      <ModeView restaurantState={restaurantState} dispatch={dispatch} />
    </TwoPanePage>
  );
}

SequencerScreen.navigationOptions = TwoPanePage.navigationOptions;
