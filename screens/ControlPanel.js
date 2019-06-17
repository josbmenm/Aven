import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import useCloudValue from '../cloud-core/useCloudValue';
import Button from '../components/Button';
import useCloud from '../cloud-core/useCloud';
import useObservable from '../cloud-core/useObservable';
import { useNavigation } from '../navigation-hooks/Hooks';
import { prettyShadow, titleStyle } from '../components/Styles';
import { computeNextSteps } from '../logic/KitchenSequence';
import { getSubsystem, getSubsystemFaults } from '../ono-cloud/OnoKitchen';

import useAsyncError from '../react-utils/useAsyncError';

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

export default function ControlPanel({ restaurantState, restaurantDispatch }) {
  const cloud = useCloud();
  const isConnected = useObservable(cloud.isConnected);
  const kitchenState = useCloudValue('KitchenState');
  const kitchenConfig = useCloudValue('OnoState^RestaurantConfig');
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
    message = 'App disconnected from server..';
  } else if (!kitchenState || !restaurantState) {
    status = 'disconnected';
    message = 'Loading state..';
  } else if (!isPLCConnected) {
    status = 'disconnected';
    message = 'Server disconnected from machine..';
  } else if (!restaurantState.isAttached) {
    status = 'disconnected';
    message = 'Detached.';
  } else {
    sequencerNames &&
      sequencerNames.forEach(systemName => {
        const system = getSubsystem(systemName, kitchenConfig, kitchenState);
        if (kitchenState[`${systemName}_NoFaults_READ`] === false) {
          const faults = getSubsystemFaults(system);
          if (faults) {
            allFaults = [
              ...allFaults,
              ...faults.map(desc => ({
                description: `${systemName} - ${desc}`,
                systemName,
              })),
            ];
          }
          if (status !== 'fault') {
            status = 'fault';
            message = `Faulted. ${systemName}`;
          } else {
            message += `, ${systemName}`;
          }
        }
      });
  }
  if (status === 'ready') {
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
      subMessage = 'Next Step: ' + nextSteps.map(s => s.description).join(', ');
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
                {restaurantState.isAutoRunning
                  ? 'Auto: Running'
                  : 'Auto: Paused'}
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
          {restaurantState && (
            <Button
              title={restaurantState.isAttached ? 'Detach' : 'Attach'}
              onPress={() => {
                if (restaurantState.isAttached) {
                  errorHandler(restaurantDispatch({ type: 'Detach' }));
                } else {
                  errorHandler(restaurantDispatch({ type: 'Attach' }));
                }
              }}
              secondary
            />
          )}
          {restaurantState && !restaurantState.isAutoRunning && (
            <Button
              title="Step"
              disabled={!nextSteps || !nextSteps.length}
              onPress={() => {
                nextSteps.forEach(step => {
                  step.perform(cloud, handleKitchenAction).then(resp => {
                    console.log('ACTION RESP', step.description, resp);
                  });
                });
              }}
              secondary
            />
          )}
        </View>
      </View>
    </View>
  );
}
