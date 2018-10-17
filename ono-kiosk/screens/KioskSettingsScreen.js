import React, { Component } from 'react';
import { Text } from 'react-native';
import Title from '../../ono-components/Title';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import LinkRow from '../../ono-components/LinkRow';
import { openSettings } from '../Payments';

export default class KioskSettingsScreen extends Component {
  render() {
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Text style={{ fontSize: 100, textAlign: 'center' }}>⚙️</Text>
        <Title>Kiosk Settings</Title>
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
