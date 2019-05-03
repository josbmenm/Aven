import React from 'react';
import GenericPage from '../components/GenericPage';
import RowSection from '../components/RowSection';
import Hero from '../components/Hero';
import LinkRow from '../components/LinkRow';
import { Image, View } from 'react-native';

export default function HomeScreenMemo({ navigation, ...props }) {
  //   <LinkRow
  //   onPress={() => {
  //     navigation.navigate({ routeName: 'HostHome' });
  //   }}
  //   icon="📋"
  //   title="Vehicle Host Panel"
  // />

  return (
    <GenericPage hideBackButton navigation={navigation} {...props}>
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
            navigation.navigate({ routeName: 'KioskHome' });
          }}
          icon="🖥"
          title="Kiosk Home"
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
      </RowSection>
    </GenericPage>
  );
}

const HomeScreen = React.memo(HomeScreenMemo);

HomeScreen.navigationOptions = GenericPage.navigationOptions;
