import React, { Component } from 'react';
import { View } from 'react-native';
import MenuItem from '../components/MenuItem';
import GenericPage from '../components/GenericPage';
import Hero from '../../ono-components/Hero';
import { mainMenu, testData } from '../../ono-data-client/OnoDataClient';
import withObservables from '@nozbe/with-observables';

const WithBlend = ({ menu, test }) => {
  return (
    <View>
      {menu.map(item => (
        <MenuItem item={item} key={item.id} />
      ))}
    </View>
  );
};
const BlendsList = withObservables([], () => ({
  menu: mainMenu,
  test: testData,
}))(WithBlend);

export default class KioskHomeScreen extends Component {
  render() {
    return (
      <GenericPage>
        <Hero title="Welcome to ONOblends" subtitle="Select a blend" />
        <BlendsList />
      </GenericPage>
    );
  }
}
