import React, { Component } from 'react';
import { View } from 'react-native';
import MenuItem from '../components/MenuItem';
import GenericPage from '../components/GenericPage';
import Hero from '../../ono-components/Hero';
import { withMenu } from '../../ono-cloud/OnoKitchen';

const MenuWithMenu = ({ menu }) => {
  return (
    <View>
      {menu.map(item => (
        <MenuItem item={item} key={item.id} />
      ))}
    </View>
  );
};
const Menu = withMenu(MenuWithMenu);

export default class KioskHomeScreen extends Component {
  render() {
    return (
      <GenericPage>
        <Hero title="Welcome to ONOblends" subtitle="Select a blend" />
        <Menu />
      </GenericPage>
    );
  }
}
