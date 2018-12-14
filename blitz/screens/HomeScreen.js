import React, { Component } from 'react';
import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import Hero from '../../components/Hero';
import LinkRow from '../../components/LinkRow';

export default class HomeScreen extends Component {
  render() {
    // <DebugData input={Client.get('airtable').observeObjectValue} />
    // <DebugData input={Client.get('truckState').observeObjectValue} />
    // <ConnectionStatus />
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Hero title="Maui Development" icon="🍹" />
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
              navigation.navigate({
                routeName: 'KitchenEngSub',
                params: {
                  system: 'BlendSystem',
                },
              });
            }}
            icon="🤖"
            title="Blend System"
          />
          <LinkRow
            onPress={() => {
              navigation.navigate({
                routeName: 'KitchenEngSub',
                params: {
                  system: 'IOSystem',
                },
              });
            }}
            icon="🔌"
            title="IO"
          />
          <LinkRow
            onPress={() => {
              navigation.navigate({ routeName: 'ManageOrders' });
            }}
            icon="🍽"
            title="Order Management"
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
