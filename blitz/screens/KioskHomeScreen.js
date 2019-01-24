import React, { Component, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import {
  genericPageStyle,
  splashText,
  highlightPrimaryColor,
} from '../../components/Styles';

import { useOrder } from '../../ono-cloud/OnoKitchen';
import FadeTransition from '../components/FadeTransition';

export default function KioskHomeScreen({ navigation, ...props }) {
  const { startOrder, resetOrder } = useOrder();
  useEffect(() => {
    resetOrder();
  }, []);
  return (
    <FadeTransition {...props} navigation={navigation}>
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
            source={require('../assets/BgHome.png')}
            style={{
              flex: 1,
              width: null,
              height: null,
              resizeMode: 'contain',
              ...StyleSheet.absoluteFillObject,
            }}
          />
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
    </FadeTransition>
  );
}

KioskHomeScreen.navigationOptions = FadeTransition.navigationOptions;
