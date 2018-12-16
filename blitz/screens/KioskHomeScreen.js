import React, { Component, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import MenuItem from '../components/MenuItem';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';
import { genericPageStyle } from '../../components/Styles';

import { useOrder } from '../../ono-cloud/OnoKitchen';

export default function KioskHomeScreen({ navigation }) {
  const { startOrder, resetOrder } = useOrder();
  useEffect(() => {
    resetOrder();
  }, []);
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        startOrder();
        navigation.navigate('ProductHome');
      }}
    >
      <View
        horizontal
        style={{ flex: 1, ...genericPageStyle }}
        contentContainerStyle={{ paddingTop: 400 }}
      >
        <Image
          style={{
            marginTop: 150,
            width: '100%',
            height: 200,
            resizeMode: 'contain',
          }}
          source={require('../assets/OnoBlendsLogo.png')}
        />

        <Text
          style={{
            fontSize: 28,
            textAlign: 'center',
          }}
        >
          Tap To Begin
        </Text>
        <Text
          style={{ color: '#555', textAlign: 'center' }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          Exit Kiosk (INTERNAL ONLY)
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}
