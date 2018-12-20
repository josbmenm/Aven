import React, { Component } from 'react';
import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import Hero from '../../components/Hero';
import LinkRow from '../../components/LinkRow';

export default function HomeScreen({ navigation }) {
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
            navigation.navigate({ routeName: 'HostHome' });
          }}
          icon="📋"
          title="Vehicle Host Panel"
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
