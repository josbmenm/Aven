import React from 'react';
import SimplePage from '../components/SimplePage';
import RowSection from '../components/RowSection';
import Hero from '../components/Hero';
import LinkRow from '../components/LinkRow';
import { Image } from 'react-native';

export default function HomeScreenMemo({ navigation, ...props }) {
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
              routeName: 'SequencingDebug',
            });
          }}
          icon={'📋'}
          title={'Kitchen Manager'}
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
        <LinkRow
          onPress={() => {
            navigation.navigate({
              routeName: 'GuideDashboard',
            });
          }}
          icon={'📋'}
          title={'Guide Dashboard'}
        />
      </RowSection>
    </SimplePage>
  );
}

const HomeScreen = React.memo(HomeScreenMemo);

HomeScreen.navigationOptions = SimplePage.navigationOptions;
