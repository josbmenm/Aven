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
import {
  genericPageStyle,
  splashText,
  highlightPrimaryColor,
} from '../../components/Styles';

import { useOrder } from '../../ono-cloud/OnoKitchen';

export default function KioskHomeScreen({ navigation }) {
  const { startOrder, resetOrder } = useOrder();
  useEffect(() => {
    resetOrder();
  }, []);
  return (
    <React.Fragment>
      <TouchableWithoutFeedback
        onPress={async () => {
          await startOrder();
          navigation.navigate('ProductHome');
        }}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', ...genericPageStyle }}
        >
          <Image
            style={{
              width: '100%',
              height: 200,
              resizeMode: 'contain',
              tintColor: highlightPrimaryColor,
            }}
            source={require('../assets/OnoBlendsLogo.png')}
          />

          <Text
            style={{
              ...splashText,
              textAlign: 'center',
              marginVertical: 80,
            }}
          >
            tap to start your order
          </Text>
        </View>
      </TouchableWithoutFeedback>
      <Text
        style={{ color: '#555', textAlign: 'center' }}
        onPress={() => {
          navigation.goBack();
        }}
      >
        Exit Kiosk (INTERNAL ONLY)
      </Text>
    </React.Fragment>
  );
}
