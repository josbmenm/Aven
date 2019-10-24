import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Button from '../components/Button';
import AsyncButton from '../components/AsyncButton';
import Tag from '../components/Tag';
import { useCloud, useCloudValue, useValue } from '../cloud-core/KiteReact';
import { useNavigation } from '../navigation-hooks/Hooks';
import {
  prettyShadow,
  titleStyle,
  primaryFontFace,
  monsterra,
  boldPrimaryFontFace,
} from '../components/Styles';
import { computeNextSteps } from '../logic/MachineLogic';
import KitchenSteps from '../logic/KitchenSteps';
import { getSubsystem, getSubsystemFaults } from '../ono-cloud/OnoKitchen';

import useAsyncError from '../react-utils/useAsyncError';
import Spinner from '../components/Spinner';
import KitchenCommands from '../logic/KitchenCommands';

function StatusPuck({ status, isRunning }) {
  let statusColor = null;
  switch (status) {
    case 'fault': {
      statusColor = Tag.negativeColor;
      break;
    }
    case 'detached':
    case 'alarm': {
      statusColor = Tag.warningColor;
      break;
    }
    case 'ready': {
      statusColor = Tag.positiveColor;
      break;
    }
    case 'disconnected':
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
      {(status === 'disconnected' || isRunning) && <Spinner />}
    </View>
  );
}

function FaultCell({ fault }) {
  const { navigate } = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        navigate('KitchenEngSub', { system: fault.systemName });
      }}
    >
      <View
        style={{
          marginHorizontal: 8,
          backgroundColor: 'white',
          // borderWidth: 3,
          borderRadius: 4,
          // borderColor: Tag.negativeColor,
          padding: 8,
          paddingHorizontal: 12,
        }}
      >
        <Text
          style={{
            ...titleStyle,
            color: Tag.negativeColor,
            fontSize: 22,
          }}
        >
          {fault.systemName}
          {fault.isFaulted ? ' Fault' : ''}
        </Text>
        <Text
          style={{
            ...primaryFontFace,
            fontSize: 22,
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

function FaultZone({ faults }) {
  const hasActuallyFaulted = faults.find(f => f.isFaulted);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        alignSelf: 'stretch',
        backgroundColor: '#333',
        ...prettyShadow,
        // flex: 1,
      }}
      contentContainerStyle={{
        flexDirection: 'row',
        paddingVertical: 8,
      }}
    >
      {faults.map(fault => {
        if (!hasActuallyFaulted || fault.isFaulted) {
          return (
            <FaultCell
              fault={fault}
              key={fault.systemName + fault.description}
            />
          );
        }
        return null;
      })}
    </ScrollView>
  );
}

export default function ControlPanel({ restaurantState, restaurantDispatch }) {
  const cloud = useCloud();
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
  let mainFaultMessage = null;
  let allFaults = [];
  if (!isConnected) {
    status = 'disconnected';
    message = 'Portal Disconnected from Restaurant.';
  } else if (restaurantState === undefined) {
    status = 'disconnected';
    message = 'Loading state..';
  } else if (!isPLCConnected) {
    status = 'disconnected';
    message = 'Server disconnected from machine.';
  } else {
    if (!kitchenState) {
      status = 'disconnected';
      message = restaurantState.isAttached
        ? 'Disconnected Sequencer'
        : 'Machine Disconnected';
    }
    if (!restaurantState.isAttached) {
      status = 'fault';
      message = 'Sequencer Disabled';
    } else if (!restaurantState.isAutoRunning) {
      status = 'detached';
      message = 'Paused';
    }
    if (kitchenState) {
      sequencerNames &&
        sequencerNames.forEach(systemName => {
          const system = getSubsystem(systemName, kitchenConfig, kitchenState);
          const faults = getSubsystemFaults(system);
          if (faults) {
            if (systemName === 'FillSystem') {
              mainFaultMessage = faults.join(',');
            }
            allFaults = [
              ...allFaults,
              ...faults.map(description => ({
                description,
                isFaulted: description !== 'Not Homed',
                systemName,
              })),
            ];
          }
        });
      const hasActuallyFaulted = allFaults.find(f => f.isFaulted);
      if (allFaults.length) {
        status = 'fault';
        if (hasActuallyFaulted) {
          message = 'Faulted';
          if (mainFaultMessage) {
            message += ` - ${mainFaultMessage}`;
          }
        } else {
          message = 'Not Homed';
        }
      }
    }
  }
  if (status !== 'disconnected') {
    sequencerNames &&
      sequencerNames.forEach(systemName => {
        if (kitchenState[`${systemName}_PrgStep_READ`] !== 0) {
          if (!isRunning) {
            isRunning = true;
            message = `Running ${systemName}(${
              kitchenState[`${systemName}_PrgStep_READ`]
            })`;
          } else {
            message += `, ${systemName}(${
              kitchenState[`${systemName}_PrgStep_READ`]
            })`;
          }
        }
      });
  }

  let nextSteps = null;
  if (restaurantState && !restaurantState.isAutoRunning) {
    nextSteps = computeNextSteps(
      KitchenSteps,
      restaurantState,
      kitchenConfig,
      kitchenState,
      KitchenCommands,
    );
    if (nextSteps && nextSteps.length) {
      subMessage = `${nextSteps.length} steps ready`;
    }
  }

  async function handleKitchenCommand(action) {
    await cloud.dispatch({
      ...action,
      type: 'KitchenCommand',
    });
  }
  return (
    <View style={{ backgroundColor: 'transparent' }}>
      {allFaults && allFaults.length > 0 && <FaultZone faults={allFaults} />}
      {restaurantState && !restaurantState.manualMode && (
        <ScrollView
          horizontal
          style={{
            height: 65,
            backgroundColor: restaurantState.isAttached ? '#dee' : '#eed',
          }}
        >
          <Text
            style={{
              ...titleStyle,
              color: restaurantState.isAttached
                ? Tag.positiveColor
                : Tag.negativeColor,
              margin: 10,
              marginTop: 16,
              fontSize: 18,
            }}
          >
            {restaurantState.isAttached
              ? 'Manual Run Step:'
              : 'Detached (Pretend) Steps:'}
          </Text>
          {nextSteps &&
            nextSteps.map((step, i) => (
              <View key={i}>
                <AsyncButton
                  title={step.description}
                  style={{ marginTop: 10, marginRight: 10 }}
                  disabled={restaurantState.isAttached && !step.isReady}
                  onPress={() => {
                    const stepPerformer = restaurantState.isAttached
                      ? step.perform
                      : step.performFake;
                    return stepPerformer(
                      cloud.get('RestaurantActions').putTransactionValue,
                      handleKitchenCommand,
                    );
                  }}
                />
              </View>
            ))}
        </ScrollView>
      )}
      <View
        style={{
          ...prettyShadow,
          height: 120,
          alignSelf: 'stretch',
          backgroundColor: 'white',
          flexDirection: 'row',
        }}
      >
        <StatusPuck status={status} isRunning={isRunning} />

        <View style={{ flex: 1, padding: 16 }}>
          {message && (
            <Text style={{ fontSize: 20, ...titleStyle }}>{message}</Text>
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

          {status === 'fault' && (
            <ControlPanelButton
              title="home system"
              disabled={kitchenState.FillSystem_PrgStep_READ !== 0}
              onPress={() => {
                handleKitchenCommand({ commandType: 'Home' });
              }}
            />
          )}

          {restaurantState && (
            <ControlPanelButton
              title={
                restaurantState.manualMode
                  ? 'disable manual mode'
                  : 'enable manual mode'
              }
              disabled={restaurantState.isAttached}
              onPress={() => {
                if (restaurantState.manualMode) {
                  restaurantDispatch({
                    type: 'DisableManualMode',
                  });
                } else {
                  restaurantDispatch({
                    type: 'EnableManualMode',
                  });
                }
              }}
            />
          )}
          {restaurantState && (
            <ControlPanelButton
              title={
                restaurantState.isAttached
                  ? 'disable sequencer'
                  : 'enable sequencer'
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
        </View>
      </View>
    </View>
  );
}
