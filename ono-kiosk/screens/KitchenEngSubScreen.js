import React, { Component } from 'react';
import Hero from '../../ono-components/Hero';
import BitRow from '../../ono-components/BitRow';
import Row from '../../ono-components/Row';
import Button from '../../ono-components/Button';
import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';

import {
  withKitchen,
  getSubsystem,
  dispatchKitchenCommand,
} from '../../ono-data-client/OnoKitchenClient';

const Subsystem = withKitchen(({ kitchenState, kitchenConfig, systemId }) => {
  const system = getSubsystem(systemId, kitchenConfig, kitchenState);
  const pulseCommands = Object.keys(system.pulseCommands);
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
                  dispatchKitchenCommand(systemId, [pulseCommand], {}).catch(
                    console.error,
                  );
                }}
              />
            ))}
          </Row>
        )}
        {Object.keys(system.reads).map(readName => (
          <BitRow
            key={readName}
            title={readName}
            value={system.reads[readName].value}
          />
        ))}
      </RowSection>
    </React.Fragment>
  );
});

export default class KitchenEngSubScreen extends Component {
  render() {
    return (
      <GenericPage>
        <Subsystem systemId={this.props.navigation.getParam('system')} />
      </GenericPage>
    );
  }
}
