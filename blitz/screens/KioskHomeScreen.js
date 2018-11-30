import React, { Component } from 'react';
import { View, ScrollView, Image, StyleSheet, Text } from 'react-native';
import MenuItem from '../components/MenuItem';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';
import { genericPageStyle } from '../../components/Styles';
import { withMenu } from '../../ono-cloud/OnoKitchen';

const Home = ({ menu, navigation }) => {
  return (
    <React.Fragment>
      <ScrollView
        horizontal
        style={{ flex: 1, ...genericPageStyle }}
        contentContainerStyle={{ paddingTop: 400 }}
      >
        {menu.map(item => (
          <MenuItem item={item} key={item.id} />
        ))}
      </ScrollView>
      <View style={{ ...StyleSheet.absoluteFillObject }} pointerEvents="none">
        <Image
          style={{
            marginTop: 150,
            width: '100%',
            height: 200,
            resizeMode: 'contain',
          }}
          source={require('../assets/OnoBlendsLogo.png')}
        />
      </View>
      <Text
        onPress={() => {
          navigation.goBack();
        }}
      >
        Exit Kiosk (INTERNAL ONLY)
      </Text>
    </React.Fragment>
  );
};
const KioskHomeScreen = withMenu(Home);
export default KioskHomeScreen;
