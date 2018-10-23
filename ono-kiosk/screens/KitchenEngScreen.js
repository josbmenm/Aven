import React, { Component } from 'react';
import Hero from '../../ono-components/Hero';
import BitRow from '../../ono-components/BitRow';
import { withNavigation } from '@react-navigation/core';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import LinkRow from '../../ono-components/LinkRow';
import {
  withKitchen,
  Client as KitchenClient,
  getSubsystemOverview,
} from '../../ono-data-client/OnoKitchenClient';
import { Client as DataClient } from '../../ono-data-client/OnoDataClient';

import withObservables from '@nozbe/with-observables';

const DataConnectionStatusRow = withObservables([], () => ({
  isConnected: DataClient.isConnected,
}))(({ isConnected }) => <BitRow title="Data Connected" value={isConnected} />);

const KitchenConnectionStatusRow = withObservables([], () => ({
  isConnected: KitchenClient.isConnected,
}))(({ isConnected }) => (
  <BitRow title="Kitchen Server Connected" value={isConnected} />
));

const Subsystems = withNavigation(
  withKitchen(({ kitchenState, kitchenConfig, navigation }) => {
    const subsystems = getSubsystemOverview(kitchenConfig, kitchenState);
    return (
      <RowSection>
        {subsystems.map(system => (
          <LinkRow
            key={system.name}
            onPress={() => {
              navigation.navigate({
                routeName: 'KitchenEngSub',
                params: { system: system.name },
              });
            }}
            icon={system.icon}
            title={`${system.name} ${
              system.noFaults === null ? '' : system.noFaults ? '👍' : '🚨'
            }`}
          />
        ))}
      </RowSection>
    );
  }),
);

export default class KitchenEngScreen extends Component {
  render() {
    return (
      <GenericPage>
        <Hero title="Kitchen Engineering" />
        <RowSection>
          <DataConnectionStatusRow />
          <KitchenConnectionStatusRow />
          <BitRow title="PLC Connected" value={true} />
        </RowSection>
        <Subsystems />
      </GenericPage>
    );
  }
}
