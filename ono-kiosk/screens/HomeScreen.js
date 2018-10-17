import React, { Component } from 'react';
import { Text } from 'react-native';
import Title from '../../ono-components/Title';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import LinkRow from '../../ono-components/LinkRow';

export default class HomeScreen extends Component {
  render() {
    // <DebugData input={Client.getRef('airtable').observeObjectValue} />
    // <DebugData input={Client.getRef('truckState').observeObjectValue} />
    // <ConnectionStatus />
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Text style={{ fontSize: 100, textAlign: 'center' }}>🍹</Text>
        <Title>Maui Development</Title>
        <RowSection>
          <LinkRow
            onPress={() => {
              navigation.navigate({ routeName: 'KitchenEng' });
            }}
            icon="🛠"
            title="Kitchen Engineering"
          />
          <LinkRow
            onPress={() => {
              navigation.navigate({ routeName: 'HostHome' });
            }}
            icon="🚛"
            title="Host Interface"
          />
          <LinkRow
            onPress={() => {
              navigation.navigate({ routeName: 'KioskHome' });
            }}
            icon="🖥"
            title="Kiosk Home"
          />
          <LinkRow
            onPress={() => {
              navigation.navigate({ routeName: 'KioskSettings' });
            }}
            icon="⚙️"
            title="Kiosk Settings"
          />
        </RowSection>
      </GenericPage>
    );
  }
}
