import React, { Component } from 'react';
import Hero from '../../components/Hero';
import BitRow from '../../components/BitRow';
import IntRow from '../../components/IntRow';
import Row from '../../components/Row';
import ButtonRow from '../../components/ButtonRow';
import Button from '../../components/Button';
import GenericPage from '../../components/GenericPage';
import RowSection from '../../components/RowSection';
import { AlertIOS, View, ScrollView, Text } from 'react-native';

import { withKitchen, getSubsystem } from '../../ono-cloud/OnoKitchen';

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
              pulseCommands.map(pulseCommand => (
                <ButtonRow title={`${pulseCommand} Action`}>
                  <Button
                    key={'params'}
                    title={'params'}
                    secondary
                    onPress={() => {}}
                  />
                  <Button
                    key={pulseCommand}
                    title={`do ${pulseCommand}`}
                    onPress={() => {
                      kitchenCommand(systemId, [pulseCommand], {}).catch(
                        console.error,
                      );
                    }}
                  />
                </ButtonRow>
              ))}
          </RowSection>
          <RowSection>
            {valueCommands.length > 0 && (
              <Row title="Command Values">
                {valueCommands.map(valueCommand => (
                  <Button
                    key={valueCommand}
                    title={`set ${valueCommand} = ${
                      system.valueCommands[valueCommand].value
                    }`}
                    onPress={() => {
                      AlertIOS.prompt(
                        'Enter new value for ' + valueCommand,
                        null,
                        value => {
                          kitchenCommand(systemId, [], {
                            [valueCommand]: Number(value),
                          }).catch(console.error);
                        },
                        'plain-text',
                        String(system.valueCommands[valueCommand].value),
                        'numeric',
                      );
                    }}
                  />
                ))}
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
