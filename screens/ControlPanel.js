import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import { useCloud, useCloudValue, useValue } from '../cloud-core/KiteReact';
import { useNavigation } from '../navigation-hooks/Hooks';
import {
  prettyShadow,
  titleStyle,
  primaryFontFace,
  monsterra,
  boldPrimaryFontFace,
} from '../components/Styles';
import { computeNextSteps } from '../logic/KitchenSequence';
import { getSubsystem, getSubsystemFaults } from '../ono-cloud/OnoKitchen';

import useAsyncError from '../react-utils/useAsyncError';
import Spinner from '../components/Spinner';

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
      statusColor = '#00990D';
      break;
    }
    case 'disconnected':
    case 'detached':
    default: {
      statusColor = '#ddd';
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
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {status === 'disconnected' && <Spinner />}
    </View>
  );
}

function FaultRow({ fault }) {
  const { navigate } = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        navigate('KitchenEngSub', { system: fault.systemName });
      }}
    >
      <View style={{ backgroundColor: '#900', padding: 6 }}>
        <Text
          style={{
            ...titleStyle,
            color: 'white',
            fontSize: 22,
            textAlign: 'center',
          }}
        >
          {fault.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ControlPanelButton({ ...props }) {
  return (
    <Button
      {...props}
      style={{ marginVertical: 16, marginHorizontal: 8 }}
      size="large"
    />
  );
}

export default function ControlPanel({ restaurantState, restaurantDispatch }) {
  const cloud = useCloud();
  // const isConnected = useObservable(cloud.isConnected);
  const isConnected = useValue(cloud.connected); // uh....
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
  const errorHandler = useAsyncError();
  let status = 'ready';
  let message = 'Ready and Idle';
  let subMessage = null;
  let isRunning = false;
  let allFaults = [];
  if (!isConnected) {
    status = 'disconnected';
    message = 'Control panel disconnected.';
  } else if (restaurantState === undefined) {
    status = 'disconnected';
    message = 'Loading state..';
  } else if (!kitchenState) {
    status = 'disconnected';
    message = 'Disconnected from machine.';
  } else if (!isPLCConnected) {
    status = 'disconnected';
    message = 'Server disconnected from machine.';
    // } else if (restaurantState.manualMode) {
    //   status = 'manual mode';
  } else if (!restaurantState.isAttached) {
    status = 'detached';
    message = 'Disabled';
  } else {
    sequencerNames &&
      sequencerNames.forEach(systemName => {
        const system = getSubsystem(systemName, kitchenConfig, kitchenState);
        const faults = getSubsystemFaults(system);
        if (faults) {
          allFaults = [
            ...allFaults,
            ...faults.map(desc => ({
              description: `${systemName} - ${desc}`,
              isFaulted: desc !== 'Not Homed',
              systemName,
            })),
          ];
        }
      });
    if (allFaults.length) {
      status = 'fault';
      if (allFaults.find(f => f.isFaulted)) {
        message = 'Faulted';
      } else {
        message = 'Not Homed';
      }
    }
  }
  if (status === 'ready' || status === 'detached') {
    sequencerNames &&
      sequencerNames.forEach(systemName => {
        if (kitchenState[`${systemName}_PrgStep_READ`] !== 0) {
          if (!isRunning) {
            isRunning = true;
            message = `Running ${systemName}`;
          } else {
            message += `, ${systemName}`;
          }
        }
      });
  }

  let nextSteps = null;
  if (restaurantState && !restaurantState.isAutoRunning) {
    nextSteps = computeNextSteps(restaurantState, kitchenConfig, kitchenState);
    if (nextSteps && nextSteps.length) {
      subMessage = `${nextSteps.length} steps ready`;
    }
  }

  async function handleKitchenAction(action) {
    await cloud.dispatch({
      ...action,
      type: 'KitchenAction',
    });
  }
  return (
    <View style={{}}>
      {allFaults.map(fault => (
        <FaultRow fault={fault} key={fault.systemName + fault.description} />
      ))}
      <View
        style={{
          ...prettyShadow,
          height: 120,
          alignSelf: 'stretch',
          backgroundColor: 'white',
          flexDirection: 'row',
        }}
      >
        <StatusPuck status={status} />

        <View style={{ flex: 1, padding: 16 }}>
          {message && (
            <Text style={{ fontSize: 32, ...titleStyle }}>{message}</Text>
          )}
          {subMessage && (
            <Text style={{ ...primaryFontFace, color: monsterra }}>
              {subMessage}
            </Text>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: 8,
          }}
        >
          {restaurantState && restaurantState.isAttached && (
            <View style={{}}>
              <Text
                style={{
                  textAlign: 'center',
                  paddingTop: 8,
                  ...boldPrimaryFontFace,
                  color: '#111',
                }}
              >
                {restaurantState.isAutoRunning
                  ? 'auto: RUNNING'
                  : 'auto: PAUSED'}
              </Text>
              <ControlPanelButton
                title={restaurantState.isAutoRunning ? 'pause' : 'start'}
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
          {restaurantState && (
            <ControlPanelButton
              title={
                restaurantState.isAttached ? 'disable' : 'enable sequencer'
              }
              disabled={restaurantState.manualMode}
              onPress={() => {
                if (restaurantState.isAttached) {
                  errorHandler(restaurantDispatch({ type: 'Detach' }));
                } else if (!restaurantState.manualMode) {
                  errorHandler(restaurantDispatch({ type: 'Attach' }));
                }
              }}
              secondary
            />
          )}
          {status === 'fault' && (
            <ControlPanelButton
              title="Home System"
              onPress={() => {
                handleKitchenAction({ command: 'Home' });
              }}
            />
          )}
          {nextSteps &&
            nextSteps.map((step, i) => (
              <View key={i}>
                <Text>{step.description}</Text>
                <ControlPanelButton
                  title="Perform"
                  onPress={() => {
                    step.perform(cloud, handleKitchenAction).then(resp => {
                      console.log('ACTION RESP', step.description, resp);
                    });
                  }}
                  secondary
                />
              </View>
            ))}

          {restaurantState && restaurantState.manualMode && (
            <ControlPanelButton
              title="disable manual mode"
              onPress={() => {
                restaurantDispatch({
                  type: 'DisableManualMode',
                });
              }}
            />
          )}
          {restaurantState &&
            !restaurantState.manualMode &&
            !restaurantState.isAttached && (
              <ControlPanelButton
                title="enable manual mode"
                disabled={restaurantState.isAttached}
                onPress={() => {
                  restaurantDispatch({
                    type: 'EnableManualMode',
                  });
                }}
              />
            )}
        </View>
      </View>
    </View>
  );
}
