import React, { Component } from 'react';
import Hero from '../../components/Hero';
import BitRow from '../../components/BitRow';
import IntRow from '../../components/IntRow';
import Row from '../../components/Row';
import ButtonRow from '../../components/ButtonRow';
import Button from '../../components/Button';
import GenericPage from '../../components/GenericPage';
import RowSection from '../../components/RowSection';
import KeyboardPopover from '../../components/KeyboardPopover';
import { usePopover } from '../../views/Popover';
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

import { withKitchen, getSubsystem } from '../../ono-cloud/OnoKitchen';
import { prettyShadow, genericText } from '../../components/Styles';

import useFocus from '../../navigation-hooks/useFocus';
import BlockFormInput from '../../components/BlockFormInput';

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

function Subsystem({ systemId, kitchenState, kitchenConfig, kitchenCommand }) {
  const system = getSubsystem(systemId, kitchenConfig, kitchenState);
  if (!system) {
    return <Hero title="System Disconnected" />;
  }
  const pulseCommands = Object.keys(system.pulseCommands || {});
  const valueCommands = Object.keys(system.valueCommands || {});

  let faults = null;
  if (system.reads.NoFaults) {
    // system has faulting behavior
    faults = [];
    if (system.reads.Fault0 && system.reads.Fault0.value) {
      const faulted = system.reads.Fault0.value
        .toString(2)
        .split('')
        .reverse()
        .map(v => v === '1');
      if (faulted[0]) {
        faults.push(
          'Watchdog timout on step ' + system.reads.WatchDogFrozeAt.value,
        );
      }
      system.faults &&
        system.faults.forEach(f => {
          if (f.intIndex !== 0) {
            throw new Error('only expecting faults on int 0 right now');
          }
          const isFaulted = faulted[f.bitIndex];
          if (isFaulted) {
            faults.push(f.description);
          }
        });
    }
    if (!faults.length && !system.reads.NoFaults.value) {
      faults.push('Unknown Fault');
    }
  }

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
                  <ButtonRow title={`${pulseCommandName} Action`}>
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
          {faults && (
            <RowSection>
              {faults.length ? (
                faults.map(fault => <Row key={fault} title={fault} />)
              ) : (
                <Row title="No Faults" />
              )}
            </RowSection>
          )}
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

const SubsystemWithKitchen = withKitchen(Subsystem);

export default class KitchenEngSubScreen extends Component {
  static navigationOptions = GenericPage.navigationOptions;
  render() {
    return (
      <GenericPage {...this.props} disableScrollView={true}>
        <SubsystemWithKitchen
          systemId={this.props.navigation.getParam('system')}
        />
      </GenericPage>
    );
  }
}
