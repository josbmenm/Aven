import React, { Component } from 'react';
import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import Hero from '../../ono-components/Hero';
import LinkRow from '../../ono-components/LinkRow';

export default class HomeScreen extends Component {
  render() {
    // <DebugData input={Client.getRef('airtable').observeObjectValue} />
    // <DebugData input={Client.getRef('truckState').observeObjectValue} />
    // <ConnectionStatus />
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Hero title="Maui" icon="🍹" />
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
              navigation.navigate({ routeName: 'DebugState' });
            }}
            icon="🚛"
            title="Restaurant State"
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
