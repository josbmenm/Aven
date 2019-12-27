import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import { View, Text } from 'react-native';
import Button from '../components/Button';
import { useSubsystemOverview } from '../ono-cloud/OnoKitchen';
import usePendantManualMode from '../components/usePendantManualMode';
import KitchenCommandButton from '../components/KitchenCommandButton';
import ButtonStack from '../components/ButtonStack';
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
import {
  colorNegative,
  colorPositive,
  colorNeutral,
} from '../components/Onotheme';

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
          <Text key={i} style={{ color: colorNegative }}>
            {fill.systemName} {fill.slot} - {fill.ingredientName} (
            {fill.isDisabled ? 'disabled' : fill.isEmpty ? 'empty' : 'errored'})
          </Text>
        ))}

      {state.fillsCompleted &&
        state.fillsCompleted.map((fill, i) => (
          <Text key={i} style={{ color: colorPositive }}>
            {fill.systemName} {fill.slot} - {fill.ingredientName} (done)
          </Text>
        ))}
      {state.fillsRemaining &&
        state.fillsRemaining.map((fill, i) => (
          <Text key={i} style={{ color: colorNeutral }}>
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
            title="wipe filling state"
            onPress={() => {
              dispatch({ type: 'WipeFillState' });
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
            title="wipe blender state"
            onPress={() => {
              dispatch({ type: 'WipeBlendState' });
            }}
          />
        )}
      </View>
    </View>
  );
}

function DeliverySystemRow({ restaurantState, dispatch }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <TaskInfoText state={restaurantState.delivery} />
        </View>
        {!restaurantState.isAttached && (
          <Button
            type="outline"
            title="wipe delivery state"
            onPress={() => {
              dispatch({ type: 'WipeDeliveryState' });
            }}
          />
        )}
      </View>
    </View>
  );

  return <TaskInfoText state={restaurantState.delivery} />;
}

function RestaurantStateList({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  const count = restaurantState.queue ? restaurantState.queue.length : 0;
  return (
    <RowSection title="material map">
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
          <DeliverySystemRow
            restaurantState={restaurantState}
            dispatch={dispatch}
          />
        </Row>
      )}
      <DeliveryBayRow restaurantState={restaurantState} dispatch={dispatch} />
      {!restaurantState.isAttached && (
        <Button
          type="outline"
          title="wipe material map state"
          onPress={() => {
            dispatch({ type: 'WipeMaterialState' });
          }}
        />
      )}
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

function HomingRow() {
  return (
    <Row title="Reset">
      <ButtonStack
        buttons={[
          <KitchenCommandButton commandType="Home" title="home system" />,
        ]}
      />
      <ButtonStack
        buttons={[
          <KitchenCommandButton
            commandType="HomeBlend"
            title="home blend+delivery"
          />,
        ]}
      />
    </Row>
  );
}

export default function SequencerScreen(props) {
  const isManualMode = usePendantManualMode();

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
        <View style={{ padding: 54 }}>
          <HomingRow />
          {isManualMode ? (
            <ManualControl
              restaurantState={restaurantState}
              dispatch={dispatch}
            />
          ) : (
            <RestaurantStateList
              restaurantState={restaurantState}
              dispatch={dispatch}
            />
          )}
        </View>
      }
    >
      <ModeView restaurantState={restaurantState} dispatch={dispatch} />
    </TwoPanePage>
  );
}

SequencerScreen.navigationOptions = TwoPanePage.navigationOptions;
