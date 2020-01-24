import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useCloud } from '../cloud-core/KiteReact';
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
import useAsyncError from '../react-utils/useAsyncError';
import { Spinner, Button, AsyncButton } from '../dash-ui';
import KitchenCommands from '../logic/KitchenCommands';
import { isStateLoaded, useDeviceId } from '../components/useAsyncStorage';
import useKitchenStatus from '../components/useKitchenStatus';
import {
  colorNegative,
  colorWarning,
  colorPositive,
} from '../components/Onotheme';

function StatusPuck({ status, isRunning }) {
  let statusColor = null;
  switch (status) {
    case 'fault': {
      statusColor = colorNegative;
      break;
    }
    case 'paused':
    case 'alarm': {
      statusColor = colorWarning;
      break;
    }
    case 'ready': {
      statusColor = colorPositive;
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
      {(status === 'disconnected' || isRunning) && <Spinner color="white" />}
    </View>
  );
}

function ManualModeButton({ restaurantState, restaurantDispatch }) {
  const deviceId = useDeviceId();
  if (!restaurantState || !isStateLoaded(deviceId)) {
    return null;
  }
  let title = 'manual locked';
  let handler = null;
  if (restaurantState.manualMode === deviceId) {
    title = 'disable manual mode';
    handler = () =>
      restaurantDispatch({
        type: 'DisableManualMode',
        lockId: deviceId,
      });
  } else if (!restaurantState.manualMode) {
    title = 'enable manual mode';
    handler = () =>
      restaurantDispatch({
        type: 'EnableManualMode',
        lockId: deviceId,
      });
  }
  return (
    <ControlPanelButton disabled={!handler} title={title} onPress={handler} />
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
          borderRadius: 4,
          padding: 8,
          paddingHorizontal: 12,
        }}
      >
        <Text
          style={{
            ...titleStyle,
            color: colorNegative,
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
  const errorHandler = useAsyncError();
  const cloud = useCloud();

  const {
    status,
    message,
    isRunning,
    allFaults,
    kitchenConfig,
    kitchenState,
  } = useKitchenStatus(restaurantState);
  let subMessage = null;

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
      {restaurantState &&
        !restaurantState.manualMode &&
        !restaurantState.isAutoRunning && (
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
                  ? colorPositive
                  : colorNegative,
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
                    errorHandler(
                      restaurantDispatch({ type: 'StartAutorun', force: true }),
                    );
                  }
                }}
                secondary
              />
            </View>
          )}

          <ManualModeButton
            restaurantState={restaurantState}
            restaurantDispatch={restaurantDispatch}
          />
          {restaurantState && (
            <ControlPanelButton
              disabled={!!restaurantState.manualMode}
              title={
                restaurantState.isAttached
                  ? 'disable sequencer'
                  : 'enable sequencer'
              }
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
        </View>
      </View>
    </View>
  );
}
