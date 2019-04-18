import React from 'react';
import GenericPage from '../../components/GenericPage';
import RowSection from '../../components/RowSection';
import Hero from '../../components/Hero';
import LinkRow from '../../components/LinkRow';

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
      </RowSection>
    </GenericPage>
  );
}

const HomeScreen = React.memo(HomeScreenMemo);

HomeScreen.navigationOptions = GenericPage.navigationOptions;
