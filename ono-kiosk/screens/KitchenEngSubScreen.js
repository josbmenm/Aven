import React, { Component } from 'react';
import Hero from '../../ono-components/Hero';
import BitRow from '../../ono-components/BitRow';
import IntRow from '../../ono-components/IntRow';
import Row from '../../ono-components/Row';
import Button from '../../ono-components/Button';
import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import { AlertIOS } from 'react-native';

import { withKitchen, getSubsystem } from '../../ono-cloud/OnoKitchen';

function Subsystem({ systemId, kitchenState, kitchenConfig, kitchenCommand }) {
  const system = getSubsystem(systemId, kitchenConfig, kitchenState);
  const pulseCommands = Object.keys(system.pulseCommands);
  const valueCommands = Object.keys(system.valueCommands);
  return (
    <React.Fragment>
      <Hero title={`${system.icon} ${system.name}`} />
      <RowSection>
        {pulseCommands.length > 0 && (
          <Row title="Pulses">
            {pulseCommands.map(pulseCommand => (
              <Button
                key={pulseCommand}
                title={pulseCommand}
                onPress={() => {
                  kitchenCommand(systemId, [pulseCommand], {}).catch(
                    console.error,
                  );
                }}
              />
            ))}
          </Row>
        )}
        {valueCommands.length > 0 && (
          <Row title="Command Values">
            {valueCommands.map(valueCommand => (
              <Button
                key={valueCommand}
                title={`Set ${valueCommand} = ${
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
    </React.Fragment>
  );
}

const SubsystemWithKitchen = withKitchen(Subsystem);

export default class KitchenEngSubScreen extends Component {
  render() {
    return (
      <GenericPage>
        <SubsystemWithKitchen
          systemId={this.props.navigation.getParam('system')}
        />
      </GenericPage>
    );
  }
}
