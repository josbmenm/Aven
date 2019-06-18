import React from 'react';
import SimplePage from '../components/SimplePage';
import RowSection from '../components/RowSection';
import LinkRow from '../components/LinkRow';
import { Image } from 'react-native';

export default function PortalHomeScreenMemo({ navigation, ...props }) {
  return (
    <SimplePage hideBackButton navigation={navigation} {...props}>
      <Image
        source={require('../components/assets/OnoLogo.png')}
        style={{
          alignSelf: 'center',
          width: 400,
          height: 400,
          marginVertical: 50,
        }}
      />
      <RowSection>
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'ProductHome' });
          }}
          icon="🍹"
          title="Order"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'Inventory' });
          }}
          icon="🍍"
          title="Inventory"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({
              routeName: 'Sequencer',
            });
          }}
          icon={'🚦'}
          title={'Sequencer'}
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({
              routeName: 'ManualControl',
            });
          }}
          icon={'⚡️'}
          title={'Manual Control'}
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({
              routeName: 'Orders',
            });
          }}
          icon={'🎟'}
          title={'Orders'}
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({
              routeName: 'RestaurantStatus',
            });
          }}
          icon={'🚐'}
          title={'Restaurant Status'}
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({
              routeName: 'DeviceManager',
            });
          }}
          icon={'📱'}
          title={'Device Manager'}
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'KitchenEng' });
          }}
          icon="🛠"
          title="Kitchen Engineering"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'KioskSettings' });
          }}
          icon="⚙️"
          title="Settings"
        />

        <LinkRow
          onPress={() => {
            navigation.navigate({
              routeName: 'EngDashboard',
            });
          }}
          icon={'📋'}
          title={'Engineering Dashboard'}
        />
      </RowSection>
    </SimplePage>
  );
}

const PortalHomeScreen = React.memo(PortalHomeScreenMemo);

PortalHomeScreen.navigationOptions = SimplePage.navigationOptions;
