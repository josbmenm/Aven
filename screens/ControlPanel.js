import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Button from '../components/Button';
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
import { computeNextSteps } from '../logic/KitchenSequence';
import { getSubsystem, getSubsystemFaults } from '../ono-cloud/OnoKitchen';

import useAsyncError from '../react-utils/useAsyncError';
import Spinner from '../components/Spinner';

function StatusPuck({ status }) {
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
      {status === 'disconnected' && <Spinner />}
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
  let mainFaultMessage = null;
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
  } else {
    if (!restaurantState.isAttached) {
      status = 'detached';
      message = 'Sequencer Disabled';
    } else if (!restaurantState.isAutoRunning) {
      status = 'detached';
      message = 'Paused';
    }
    if (
      kitchenState.FillSystem_PrgStep_READ >= 106 &&
      kitchenState.FillSystem_PrgStep_READ <= 165
    ) {
      status = 'detached';
      message = 'Homing';
    }

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
    nextSteps = computeNextSteps(restaurantState, kitchenConfig, kitchenState);
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
            <Text style={{ fontSize: 26, ...titleStyle }}>{message}</Text>
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
          {restaurantState &&
            restaurantState.isAttached &&
            nextSteps &&
            nextSteps.map((step, i) => (
              <View key={i}>
                <ControlPanelButton
                  title="go step"
                  onPress={() => {
                    step
                      .perform(
                        cloud.get('RestaurantActions').putTransactionValue,
                        handleKitchenCommand,
                      )
                      .then(resp => {
                        console.log('ACTION RESP', step.description, resp);
                      });
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      marginVertical: 8,
                      fontSize: 18,
                      ...primaryFontFace,
                    }}
                  >
                    {step.description}
                  </Text>
                </ControlPanelButton>
              </View>
            ))}
          {restaurantState &&
            !restaurantState.isAttached &&
            nextSteps &&
            nextSteps.map((step, i) => (
              <View key={i}>
                <ControlPanelButton
                  title="go FAKE step"
                  onPress={() => {
                    step
                      .performFake(
                        cloud.get('RestaurantActions').putTransactionValue,
                        handleKitchenCommand,
                      )
                      .then(resp => {
                        console.log('ACTION RESP', step.description, resp);
                      });
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      marginVertical: 8,
                      fontSize: 18,
                      ...primaryFontFace,
                    }}
                  >
                    {step.description}
                  </Text>
                </ControlPanelButton>
              </View>
            ))}
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
                handleKitchenCommand({ command: 'Home' });
              }}
            />
          )}
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
