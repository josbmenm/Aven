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
                  system: 'System',
                },
              });
            }}
            icon="🤖"
            title="System"
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
              navigation.navigate({
                routeName: 'KitchenEngSub',
                params: {
                  system: 'FillPositioner',
                },
              });
            }}
            icon="↔️"
            title="Fill Positioner"
          />
          <LinkRow
            onPress={() => {
              navigation.navigate({
                routeName: 'KitchenEngSub',
                params: {
                  system: 'FillSystem',
                },
              });
            }}
            icon="🥙"
            title="Fill System"
          />
          <LinkRow
            onPress={() => {
              navigation.navigate({
                routeName: 'KitchenEngSub',
                params: {
                  system: 'Granule0',
                },
              });
            }}
            icon="🍚"
            title="Granule 0"
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
