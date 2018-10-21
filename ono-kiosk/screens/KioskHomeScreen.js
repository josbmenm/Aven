import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TouchableHighlight,
  AlertIOS,
  Image,
} from 'react-native';
import MenuItem from '../components/MenuItem';
import GenericPage from '../components/GenericPage';
import Title from '../../ono-components/Title';
import CallToActionButton from '../../ono-components/CallToActionButton';
import { mainMenu, testData } from '../../ono-data-client/OnoDataClient';
import withObservables from '@nozbe/with-observables';
import { Buffer } from 'buffer';

const WithBlend = ({ menu, test }) => {
  console.log('TEST', test);
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
        <Title>Select a blend</Title>
        <BlendsList />
      </GenericPage>
    );
  }
}
