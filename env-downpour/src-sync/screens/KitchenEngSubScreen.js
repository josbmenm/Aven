import React, { Component } from 'react';
import Hero from '../components/Hero';
import BitRow from '../components/BitRow';
import IntRow from '../components/IntRow';
import Row from '../components/Row';
import ButtonRow from '../components/ButtonRow';
import Button from '../components/Button';
import GenericPage from '../components/GenericPage';
import RowSection from '../components/RowSection';
import KeyboardPopover from '../components/KeyboardPopover';
import { usePopover } from '../views/Popover';
import {
  AlertIOS,
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';

import { useCloud, useCloudValue } from '../cloud-core/KiteReact';
import { getSubsystem, getSubsystemFaults } from '../ono-cloud/OnoKitchen';
import {
  prettyShadow,
  genericText,
  boldPrimaryFontFace,
} from '../components/Styles';

import useFocus from '../navigation-hooks/useFocus';
import BlockFormInput from '../components/BlockFormInput';
import { useNavigation } from '../navigation-hooks/Hooks';

function SystemActionForm({
  pulse,
  system,
  kitchenCommand,
  onClose,
  systemId,
}) {
  const initialValues = {};
  pulse.params.forEach(paramName => {
    console.log('trol', paramName, system.valueCommands[paramName].value);
    const v = system.valueCommands[paramName].value;
    initialValues[paramName] = v === null ? null : v.toString();
  });
  const [draftValues, dispatch] = React.useReducer((values, action) => {
    if (action.set) {
      return { ...values, [action.set]: action.value };
    }
    return values;
  }, initialValues);

  function handleSubmit() {
    debugger;
  }

  const inputRenderers = pulse.params.map(paramName => inputProps => {
    return (
      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        <BlockFormInput
          {...inputProps}
          label={paramName}
          mode="number"
          onValue={value => {
            dispatch({ set: paramName, value });
          }}
          value={draftValues[paramName]}
        />
      </View>
    );
  });

  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });

  return (
    <React.Fragment>
      {inputs}
      <Button
        onPress={() => {
          const vals = {};
          Object.keys(draftValues).forEach(valName => {
            vals[valName] = Number(draftValues[valName]);
          });
          kitchenCommand(systemId, [], vals);
          onClose();
        }}
        title="save"
        secondary
      />
      <Button
        onPress={() => {
          const vals = {};
          Object.keys(draftValues).forEach(valName => {
            vals[valName] = Number(draftValues[valName]);
          });
          kitchenCommand(systemId, [pulse.name], vals);
        }}
        title={`do ${pulse.name}`}
      />
    </React.Fragment>
  );
}
function SetParamsButton({ pulse, system, kitchenCommand, systemId }) {
  if (!pulse.params) {
    return null;
  }
  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <SystemActionForm
            pulse={pulse}
            onClose={onClose}
            system={system}
            kitchenCommand={kitchenCommand}
            systemId={systemId}
          />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );
  return <Button title="params" secondary onPress={onPopover} />;
}
function SetValueForm({ val, system, kitchenCommand, systemId, onClose }) {
  const [draftValue, setDraftValue] = React.useState(val.value.toString());

  function handleSubmit() {
    debugger;
  }

  const inputRenderers = [
    inputProps => (
      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        <BlockFormInput
          {...inputProps}
          label={val.name}
          mode="number"
          onValue={setDraftValue}
          value={draftValue}
        />
      </View>
    ),
  ];

  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });

  return (
    <React.Fragment>
      {inputs}
      <Button
        onPress={() => {
          kitchenCommand(systemId, [], {
            [val.name]: draftValue,
          });
          onClose();
        }}
        title="save"
        secondary
      />
    </React.Fragment>
  );
}
function SetValueButton({ val, system, kitchenCommand, systemId }) {
  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <SetValueForm
            val={val}
            system={system}
            kitchenCommand={kitchenCommand}
            systemId={systemId}
            onClose={onClose}
          />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );
  return <Button title="set" secondary onPress={onPopover} />;
}

function FaultsRows({ faults }) {
  return (
    <RowSection>
      {faults.map(fault => (
        <View
          style={{
            backgroundColor: '#900',
            ...prettyShadow,
            marginBottom: 10,
            padding: 20,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              ...boldPrimaryFontFace,
              color: 'white',
              textAlign: 'center',
              fontSize: 36,
            }}
          >
            {fault}
          </Text>
        </View>
      ))}
    </RowSection>
  );
}
function SystemView({ system, systemId, kitchenCommand }) {
  if (!system) {
    return <Hero title="System Disconnected" />;
  }
  const pulseCommands = Object.keys(system.pulseCommands || {});
  const valueCommands = Object.keys(system.valueCommands || {});
  const faults = getSubsystemFaults(system);
  return (
    <React.Fragment>
      <Hero title={`${system.icon} ${system.name}`} />
      <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
        <ScrollView style={{ flex: 1 }}>
          <RowSection>
            {pulseCommands.length > 0 &&
              pulseCommands.map(pulseCommandName => {
                const pulse = system.pulseCommands[pulseCommandName];
                return (
                  <ButtonRow
                    title={`${pulseCommandName} Action`}
                    key={pulseCommandName}
                  >
                    <SetParamsButton
                      pulse={pulse}
                      kitchenCommand={kitchenCommand}
                      system={system}
                      systemId={systemId}
                    />
                    <Button
                      key={pulseCommandName}
                      title={`do ${pulseCommandName}`}
                      onPress={() => {
                        kitchenCommand(systemId, [pulseCommandName], {}).catch(
                          console.error,
                        );
                      }}
                    />
                  </ButtonRow>
                );
              })}
          </RowSection>
          <RowSection>
            {valueCommands.length > 0 && (
              <Row title="Command Values">
                <View style={{ flex: 1 }}>
                  {valueCommands.map(valueCommand => {
                    const val = system.valueCommands[valueCommand];
                    if (val.type === 'boolean') {
                      return (
                        <View
                          style={{
                            // alignSelf: 'stretch',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                          key={valueCommand}
                        >
                          <Text
                            style={{
                              fontSize: 32,
                              ...genericText,
                            }}
                          >
                            {valueCommand}
                          </Text>
                          <Text
                            style={{
                              marginHorizontal: 10,
                              fontSize: 42,
                              ...genericText,
                              color: '#414',
                            }}
                          >
                            {val.value ? 'True' : 'False'}
                          </Text>
                          <Button
                            title={val.value ? 'set OFF' : 'set ON'}
                            onPress={() => {
                              kitchenCommand(systemId, [], {
                                [valueCommand]: !val.value,
                              });
                            }}
                          />
                        </View>
                      );
                    }
                    return (
                      <View
                        style={{
                          // alignSelf: 'stretch',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                        key={valueCommand}
                      >
                        <Text
                          style={{
                            fontSize: 32,
                            ...genericText,
                          }}
                        >
                          {valueCommand}
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 10,
                            fontSize: 42,
                            ...genericText,
                            color: '#414',
                          }}
                        >
                          {val.value}
                        </Text>
                        <SetValueButton
                          system={system}
                          systemId={systemId}
                          val={val}
                          kitchenCommand={kitchenCommand}
                        />
                      </View>
                    );
                  })}
                </View>
              </Row>
            )}
          </RowSection>
        </ScrollView>
        <ScrollView style={{ flex: 1 }}>
          {faults && <FaultsRows faults={faults} />}

          <RowSection>
            {Object.keys(system.reads).map(readName => {
              const r = system.reads[readName];
              if (r.type === 'integer') {
                return (
                  <IntRow
                    key={readName}
                    title={readName}
                    value={system.reads[readName].value}
                  />
                );
              } else if (r.type === 'boolean') {
                return (
                  <BitRow
                    key={readName}
                    title={readName}
                    value={system.reads[readName].value}
                  />
                );
              } else {
                throw new Error('unknown type');
              }
            })}
          </RowSection>
        </ScrollView>
      </View>
    </React.Fragment>
  );
}
export default function Subsystem({ ...props }) {
  const { getParam } = useNavigation();
  const systemId = getParam('system');
  const cloud = useCloud();
  const kitchenState = useCloudValue('KitchenState');
  const kitchenConfig = useCloudValue('KitchenConfig');
  async function kitchenCommand(subsystemName, pulse, values) {
    return await cloud.dispatch({
      type: 'KitchenCommand',
      subsystem: subsystemName,
      pulse,
      values,
    });
  }
  const system = getSubsystem(systemId, kitchenConfig, kitchenState);
  return (
    <GenericPage {...props} disableScrollView={true}>
      <SystemView
        system={system}
        systemId={systemId}
        kitchenCommand={kitchenCommand}
      />
    </GenericPage>
  );
}

Subsystem.navigationOptions = GenericPage.navigationOptions;
