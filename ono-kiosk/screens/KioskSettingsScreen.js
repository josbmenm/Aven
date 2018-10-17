import React, { Component } from 'react';
import { Text } from 'react-native';
import Title from '../../ono-components/Title';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import LinkRow from '../../ono-components/LinkRow';

export default class KioskSettingsScreen extends Component {
  render() {
    // <DebugData input={Client.getRef('airtable').observeObjectValue} />
    // <DebugData input={Client.getRef('truckState').observeObjectValue} />
    // <ConnectionStatus />
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Text style={{ fontSize: 100, textAlign: 'center' }} />
        <Title>Kiosk Settings</Title>
        <RowSection>
          <LinkRow onPress={() => {}} icon="🛠" title="Payment Settings" />
          <LinkRow
            onPress={() => {
              navigation.navigate({ routeName: 'CollectPayment' });
            }}
            icon="🛠"
            title="Payment Collect"
          />
          <LinkRow
            onPress={() => {
              throw new Error('User-forced crash!');
            }}
            icon="⚠️"
            title="Test App Crash"
          />
        </RowSection>
      </GenericPage>
    );
  }
}
