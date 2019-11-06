import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import { View, Text } from 'react-native';
import Button from '../components/Button';
import { useSubsystemOverview } from '../ono-cloud/OnoKitchen';

import RowSection from '../components/RowSection';
import Subtitle from '../components/Subtitle';
import Row from '../components/Row';
import {
  proseFontFace,
  primaryFontFace,
  monsterra80,
} from '../components/Styles';
import ControlPanel from './ControlPanel';
import ManualControl from './ManualControl';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import { useNavigation } from '../navigation-hooks/Hooks';
import LinkRow from '../components/LinkRow';
import Tag from '../components/Tag';

function Subsystems() {
  const subsystems = useSubsystemOverview();
  const navigation = useNavigation();
  return (
    <RowSection>
      {subsystems.map(system => (
        <LinkRow
          key={system.name}
          onPress={() => {
            navigation.navigate({
              routeName: 'KitchenEngSub',
              params: { system: system.name },
            });
          }}
          icon={system.icon}
          title={system.name}
          rightIcon={
            system.noFaults === null ? '' : system.noFaults ? '👍' : '🚨'
          }
        />
      ))}
    </RowSection>
  );
}

function TaskInfoText({ state }) {
  if (!state || !state.task) {
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
        {state.task.name}
      </Text>
      <Text style={{ fontSize: 24, ...primaryFontFace, color: '#282828' }}>
        {state.task.blendName}
        {state.fillsFailed && state.fillsFailed.length ? ' (failed)' : ''}
      </Text>
    </View>
  );
}

function BayInfo({ bayState, name, dispatch, bayId }) {
  let content = null;
  if (bayState) {
    content = (
      <View style={{ flex: 1 }}>
        <TaskInfoText state={bayState} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Subtitle title={name} />
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
    ((restaurantState.delivery0 || restaurantState.delivery1) && (
      <Row>
        <BayInfo
          bayState={restaurantState.delivery0}
          bayId="delivery0"
          name="deliver left"
          dispatch={dispatch}
        />
        <BayInfo
          bayState={restaurantState.delivery1}
          bayId="delivery1"
          name="deliver right"
          dispatch={dispatch}
        />
      </Row>
    )) ||
    null
  );
}

export function FillsDisplay({ state }) {
  return (
    <View style={{}}>
      {state.fillsFailed &&
        state.fillsFailed.map((fill, i) => (
          <Text key={i} style={{ color: Tag.negativeColor }}>
            {fill.systemName} {fill.slot} - {fill.ingredientName} (
            {fill.isDisabled ? 'disabled' : fill.isEmpty ? 'empty' : 'errored'})
          </Text>
        ))}

      {state.fillsCompleted &&
        state.fillsCompleted.map((fill, i) => (
          <Text key={i} style={{ color: Tag.positiveColor }}>
            {fill.systemName} {fill.slot} - {fill.ingredientName} (done)
          </Text>
        ))}
      {state.fillsRemaining &&
        state.fillsRemaining.map((fill, i) => (
          <Text key={i} style={{ color: Tag.neutralColor }}>
            {fill.systemName} {fill.slot} - {fill.ingredientName}
          </Text>
        ))}
    </View>
  );
}

function FillRow({ restaurantState, dispatch }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          {restaurantState.fill && (
            <TaskInfoText state={restaurantState.fill} />
          )}
        </View>
        {!restaurantState.isAttached && (
          <Button
            type="outline"
            title="wipe filling task state"
            onPress={() => {
              dispatch({ type: 'WipeFillTaskState' });
            }}
          />
        )}
      </View>
      <FillsDisplay state={restaurantState.fill} />
    </View>
  );
}
function BlendRow({ restaurantState, dispatch }) {
  if (restaurantState.blend === 'dirty') {
    return <Text>Dirty Blender</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <TaskInfoText state={restaurantState.blend} />
        </View>
        {!restaurantState.isAttached && (
          <Button
            type="outline"
            title="wipe blender task state"
            onPress={() => {
              dispatch({ type: 'WipeBlendTaskState' });
            }}
          />
        )}
      </View>
    </View>
  );
}

function DeliverySystemRow({ state }) {
  return <TaskInfoText state={state} />;
}

function RestaurantStateList({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  const count = restaurantState.queue ? restaurantState.queue.length : 0;
  return (
    <RowSection title="material map" style={{ marginTop: 42 }}>
      <Row title={`${count} task${count === 1 ? '' : 's'} in queue`} />
      {restaurantState.fill && restaurantState.fill !== 'ready' && (
        <Row title="filling">
          <FillRow restaurantState={restaurantState} dispatch={dispatch} />
        </Row>
      )}
      {restaurantState.blend && (
        <Row title="blender">
          <BlendRow restaurantState={restaurantState} dispatch={dispatch} />
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
      <Subsystems />
    </View>
  );
}

export default function SequencerScreen(props) {
  const [restaurantState, dispatch] = useRestaurantState();
  return (
    <TwoPanePage
      {...props}
      footer={
        <ControlPanel
          restaurantState={restaurantState}
          restaurantDispatch={dispatch}
        />
      }
      side={
        restaurantState && restaurantState.manualMode ? (
          <ManualControl
            restaurantState={restaurantState}
            dispatch={dispatch}
          />
        ) : (
          <RestaurantStateList
            restaurantState={restaurantState}
            dispatch={dispatch}
          />
        )
      }
    >
      <ModeView restaurantState={restaurantState} dispatch={dispatch} />
    </TwoPanePage>
  );
}

SequencerScreen.navigationOptions = TwoPanePage.navigationOptions;
