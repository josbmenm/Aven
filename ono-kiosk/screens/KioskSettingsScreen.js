import React, { Component } from 'react';
import { Text } from 'react-native';
import Hero from '../../ono-components/Hero';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import LinkRow from '../../ono-components/LinkRow';
import { openSettings } from '../Payments';

export default class KioskSettingsScreen extends Component {
  render() {
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Hero icon="⚙️" title="Kiosk Settings" />
        <RowSection>
          <LinkRow
            onPress={() => {
              openSettings().catch(console.error);
            }}
            icon="🛠"
            title="Square Reader Settings"
          />
          <LinkRow
            onPress={() => {
              navigation.navigate({ routeName: 'PaymentDebug' });
            }}
            icon="💸"
            title="Test Payment"
          />
          <LinkRow
            onPress={() => {
              throw new Error('User-forced error!');
            }}
            icon="⚠️"
            title="Test App Error"
          />
        </RowSection>
      </GenericPage>
    );
  }
}
