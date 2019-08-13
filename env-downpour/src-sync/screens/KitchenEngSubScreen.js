import React from 'react';
import BitRow from '../components/BitRow';
import IntRow from '../components/IntRow';
import Row from '../components/Row';
import ButtonRow from '../components/ButtonRow';
import Button from '../components/Button';
import RowSection from '../components/RowSection';
import KeyboardPopover from '../components/KeyboardPopover';
import { usePopover } from '../views/Popover';
import { View, Text } from 'react-native';
import { Easing } from 'react-native-reanimated';
import DisconnectedPage from '../components/DisconnectedPage';
import { useCloud, useCloudValue, useValue } from '../cloud-core/KiteReact';
import { getSubsystem } from '../ono-cloud/OnoKitchen';
import { genericText } from '../components/Styles';
import useFocus from '../navigation-hooks/useFocus';
import { SystemFaultsAndAlarms } from '../components/FaultsAndAlarms';
import BlockFormInput from '../components/BlockFormInput';
import { useNavigation } from '../navigation-hooks/Hooks';
import TwoPanePage from '../components/TwoPanePage';

const HiddenReads = new Set([
  'NoFaults',
  'NoAlarms',
  'Homed',
  'WatchDogFrozeAt',
  'Fault0',
  'Fault1',
  'Fault2',
  'Fault3',
  'Alarm0',
  'ActionIdStarted',
  'ActionIdEnded',
]);

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
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
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
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
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

function ReadsAndFaults({ system }) {
  if (!system) {
    return null;
  }
  return (
    <React.Fragment>
      <SystemFaultsAndAlarms system={system} />
      <RowSection>
        {Object.keys(system.reads).map(readName => {
          if (HiddenReads.has(readName)) {
            return null;
          }
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
    </React.Fragment>
  );
}
function SystemView({ system, systemId, kitchenCommand }) {
  if (!system) {
    return null;
  }
  const pulseCommands = Object.keys(system.pulseCommands || {});
  const valueCommands = Object.keys(system.valueCommands || {});
  return (
    <React.Fragment>
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
                if (valueCommand === 'ActionIdIn') {
                  return null;
                }
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
    </React.Fragment>
  );
}
export default function Subsystem({ ...props }) {
  const { getParam } = useNavigation();
  const systemId = getParam('system');
  const kitchenState = useCloudValue('KitchenState');
  const kitchenConfig = useCloudValue('KitchenConfig');
  const cloud = useCloud();
  async function kitchenCommand(subsystemName, pulse, values) {
    return await cloud.dispatch({
      type: 'KitchenWriteMachineValues',
      subsystem: subsystemName,
      pulse,
      values,
    });
  }
  const system = getSubsystem(systemId, kitchenConfig, kitchenState);
  const isConnected = useValue(cloud.connected);

  return (
    <TwoPanePage
      {...props}
      title={system ? `${system.icon} ${system.name}` : null}
      side={isConnected ? <ReadsAndFaults system={system} /> : null}
    >
      {isConnected ? (
        <SystemView
          system={system}
          systemId={systemId}
          kitchenCommand={kitchenCommand}
        />
      ) : (
        <DisconnectedPage />
      )}
    </TwoPanePage>
  );
}

Subsystem.navigationOptions = TwoPanePage.navigationOptions;
