import React, { Component, memo } from 'react';
import { Text } from 'react-native';
import GenericPage from '../../components/GenericPage';
import RowSection from '../../components/RowSection';
import Hero from '../../components/Hero';
import LinkRow from '../../components/LinkRow';

import codePush from 'react-native-code-push';

export default function HomeScreenMemo({ navigation, ...props }) {
  //   <LinkRow
  //   onPress={() => {
  //     navigation.navigate({ routeName: 'HostHome' });
  //   }}
  //   icon="📋"
  //   title="Vehicle Host Panel"
  // />
  let [updateMetadata, setUpdateMetadata] = React.useState(null);
  React.useEffect(() => {
    codePush
      .getUpdateMetadata()
      .then(m => {
        console.log('huh', m);
        setUpdateMetadata(m);
      })
      .catch(console.error);
    return () => {};
  }, []);
  return (
    <GenericPage hideBackButton navigation={navigation} {...props}>
      <Hero title="Maui Development" icon="🍹" />
      <RowSection>
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'ComponentPlayground' });
          }}
          icon="🧱"
          title="Component Playground"
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
          title="Settings"
        />
        <Text>{JSON.stringify(updateMetadata)}</Text>
      </RowSection>
    </GenericPage>
  );
}

const HomeScreen = memo(HomeScreenMemo);

HomeScreen.navigationOptions = GenericPage.navigationOptions;
