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
} from '../components/Styles';

import { useOrder } from '../ono-cloud/OrderContext';
import FadeTransition from '../components/FadeTransition';

export default function KioskHomeScreen({ navigation, ...props }) {
  const { resetOrder } = useOrder();
  useEffect(() => {
    resetOrder();
  }, []);
  return (
    <FadeTransition
      {...props}
      navigation={navigation}
      background={
        <Image
          source={require('../components/assets/BgHome.png')}
          style={{
            // flex: 1,
            width: null,
            height: null,
            resizeMode: 'contain',
            ...StyleSheet.absoluteFillObject,
          }}
        />
      }
    >
      <TouchableWithoutFeedback
        onPress={async () => {
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
            source={require('../components/assets/OnoBlendsLogo.png')}
          />

          <Text
            style={{
              ...splashText,
              textAlign: 'center',
              marginVertical: 40,
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
