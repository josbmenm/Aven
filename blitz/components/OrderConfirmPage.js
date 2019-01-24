import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import GenericPage from './GenericPage';
import Button from '../../components/Button';
import Receipt from '../../components/Receipt';
import { BlurView } from 'react-native-blur';
import Animated, { Easing } from 'react-native-reanimated';
import { useNavigation } from '../../navigation-hooks/Hooks';
import FadeTransition from './FadeTransition';

const cardHeight = 516;

function waveIndefinitely(position) {
  Animated.timing(position, {
    toValue: 2,
    duration: 3000,
    easing: Easing.inOut(Easing.cubic),
  }).start(evt => {
    if (evt.finished) {
      Animated.timing(position, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.cubic),
      }).start(evt => {
        if (evt.finished) {
          waveIndefinitely(position);
        }
      });
    }
  });
}

function AnimateyCreditCard({ ready }) {
  const isReady = ready === undefined ? true : ready;
  const [position] = useState(new Animated.Value(0));

  useEffect(
    () => {
      if (isReady) {
        Animated.timing(position, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.cubic),
        }).start(evt => {
          if (evt.finished) {
            waveIndefinitely(position);
          }
        });
      } else {
        Animated.timing(position, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.cubic),
        }).start();
      }
    },
    [isReady],
  );

  return (
    <Animated.View
      style={{
        height: cardHeight,
        position: 'absolute',
        right: 0,
        left: 0,
        bottom: 0,
        alignItems: 'center',
        transform: [
          {
            translateY: Animated.interpolate(position, {
              inputRange: [0, 1, 2],
              outputRange: [cardHeight, cardHeight * 0.4, cardHeight * 0.6],
            }),
          },
        ],
      }}
    >
      <Image
        style={{
          flex: 1,
          resizeMode: 'contain',
        }}
        source={require('../assets/CreditCard.png')}
      />
    </Animated.View>
  );
}

function CloseButton() {
  const { goBack } = useNavigation();
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        top: 32,
        right: 32,
        width: 50,
        height: 50,
      }}
      hitSlop={{ left: 120, top: 120, right: 120, bottom: 120 }}
      onPress={() => goBack()}
    >
      <Image
        source={require('../assets/ModalClose.png')}
        style={{ width: 50, height: 50 }}
      />
    </TouchableOpacity>
  );
}

export default function OrderConfirmPage({
  summary,
  skipPayment,
  readerState,
  backBehavior,
  ...props
}) {
  return (
    <FadeTransition
      backgroundColor={'#00000040'}
      background={
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={10}
        />
      }
      {...props}
    >
      <CloseButton />
      <Receipt summary={summary} readerState={readerState} />
      <Text
        style={{
          color: 'white',
          fontSize: 30,
          width: 300,
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {JSON.stringify(readerState)}
      </Text>

      <View
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 350,
          height: 50,
        }}
      >
        <Button title="skip payment (TEST ONLY)" onPress={skipPayment} />
      </View>
      <AnimateyCreditCard />
    </FadeTransition>
  );
}

OrderConfirmPage.navigationOptions = FadeTransition.navigationOptions;
