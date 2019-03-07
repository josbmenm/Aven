import React, { Component } from 'react';
import Hero from '../../components/Hero';
import BitRow from '../../components/BitRow';
import { withNavigation } from '../../navigation-core';

import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import LinkRow from '../../components/LinkRow';
import {
  getSubsystemOverview,
  withKitchen,
  withRestaurant,
} from '../../ono-cloud/OnoKitchen';
import withObservables from '@nozbe/with-observables';

const IsConnectedWithState = ({ isConnected }) => (
  <BitRow title="Server Connected" value={isConnected} />
);

const IsConnected = withObservables(['isConnected'], ({ isConnected }) => ({
  isConnected,
}))(IsConnectedWithState);

const IsConnectedRow = withRestaurant(({ restaurantClient }) => (
  <IsConnected isConnected={restaurantClient.isConnected} />
));

const PLCConnectedRow = withKitchen(({ kitchenState }) => (
  <BitRow
    title="PLC Connected"
    value={kitchenState && kitchenState.isPLCConnected}
  />
));

const Subsystems = withNavigation(
  withKitchen(({ navigation, kitchenState, kitchenConfig }) => {
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
  static navigationOptions = GenericPage.navigationOptions;
  render() {
    return (
      <GenericPage {...this.props}>
        <Hero title="Kitchen Engineering" icon="🛠" />
        <RowSection>
          <PLCConnectedRow />
          <IsConnectedRow />
        </RowSection>
        <Subsystems />
      </GenericPage>
    );
  }
}
