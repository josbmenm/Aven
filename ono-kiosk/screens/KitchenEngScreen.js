import React, { Component } from 'react';
import Hero from '../../ono-components/Hero';
import BitRow from '../../ono-components/BitRow';
import { withNavigation } from '@react-navigation/core';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import LinkRow from '../../ono-components/LinkRow';
import { getSubsystemOverview, withKitchen } from '../../ono-cloud/OnoKitchen';

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
  render() {
    return (
      <GenericPage>
        <Hero title="Kitchen Engineering" />
        <RowSection>
          <BitRow title="PLC Connected" value={true} />
        </RowSection>
        <Subsystems />
      </GenericPage>
    );
  }
}
