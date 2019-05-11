import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import GenericPage from './GenericPage';
import Button from './Button';
import Receipt from './Receipt';
import { BlurView } from 'react-native-blur';
import Animated, { Easing } from 'react-native-reanimated';
import { useNavigation } from '../navigation-hooks/Hooks';
import FadeTransition from './FadeTransition';
import { boldPrimaryFontFace } from './Styles';

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

  useEffect(() => {
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
  }, [isReady]);

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
              outputRange: [cardHeight, cardHeight * 0.5, cardHeight * 0.7],
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
        source={require('./assets/CreditCard.png')}
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
        source={require('./assets/ModalClose.png')}
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
  console.log('---- =======');
  console.log(`---- errorStep: ${JSON.stringify(readerState.errorStep)}`);
  console.log(`---- inputOptions: ${JSON.stringify(readerState.inputOptions)}`);
  console.log(`---- status: ${JSON.stringify(readerState.status)}`);
  console.log(`---- promptType: ${JSON.stringify(readerState.promptType)}`);
  console.log(`---- isCollecting: ${JSON.stringify(readerState.isCollecting)}`);
  console.log(`---- errorCode: ${JSON.stringify(readerState.errorCode)}`);
  console.log(
    `---- errorDeclineCode: ${JSON.stringify(readerState.errorDeclineCode)}`,
  );
  console.log(
    `---- isCardInserted: ${JSON.stringify(readerState.isCardInserted)}`,
  );

  const {
    inputOptions,
    status,
    promptType,
    isCollecting,
    isCardInserted,
    errorStep,
    errorCode,
    errorDeclineCode,
  } = readerState;
  let message = null;

  function hasInputOption(name) {
    return (
      status === 'CollectingPaymentMethod' &&
      inputOptions &&
      inputOptions.indexOf(name) !== -1
    );
  }
  if (
    isCollecting &&
    !isCardInserted &&
    hasInputOption('InsertCard') &&
    hasInputOption('TapCard')
  ) {
    message = 'insert card or tap payment';
  } else if (isCollecting && !isCardInserted && hasInputOption('InsertCard')) {
    message = 'insert card';
  }

  if (!message && promptType === 'TryAnotherReadMethod') {
    message = 'try another payment method';
  }

  if (!message && status === 'CollectingPaymentIntent') {
    message = 'please wait.';
  }

  if (!message && status === 'NotReady') {
    message = 'please wait.';
  }

  if (!message && errorStep === 'confirmPaymentIntent' && errorCode === 103) {
    message = 'card declined ' + errorDeclineCode;
  }

  if (!message) {
    // message = 'hmm..';
  }

  let bottomContent = <AnimateyCreditCard />;

  if (summary && summary.total === 0) {
    bottomContent = (
      <View
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          left: 20,
          height: 80,
          alignItems: 'center',
        }}
      >
        <Button title="Confirm Order" onPress={skipPayment} />
      </View>
    );
  }

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
      <Receipt summary={summary} />
      <Text
        style={{
          color: 'white',
          fontSize: 30,
          position: 'absolute',
          left: 0,
          right: 0,
          height: 50,
          textAlign: 'center',
          bottom: 300,
          ...boldPrimaryFontFace,
        }}
      >
        {message}
      </Text>
      {bottomContent}
    </FadeTransition>
  );
}

OrderConfirmPage.navigationOptions = FadeTransition.navigationOptions;
