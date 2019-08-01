import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import SimplePage from '../components/SimplePage';
import RowSection from '../components/RowSection';
import LinkRow from '../components/LinkRow';
import { Image } from 'react-native';

export default function PortalHomeScreenMemo({ navigation, ...props }) {
  return (
    <SimplePage hideBackButton navigation={navigation} {...props}>
      <RootAuthenticationSection>
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
              navigation.navigate({ routeName: 'KitchenEng' });
            }}
            icon="🛠"
            title="Kitchen Engineering"
          />
        </RowSection>
      </RootAuthenticationSection>
    </SimplePage>
  );
}

const PortalHomeScreen = React.memo(PortalHomeScreenMemo);

PortalHomeScreen.navigationOptions = SimplePage.navigationOptions;
