import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import SpinnerButton from './SpinnerButton';
import Receipt from './Receipt';
import { BlurView } from 'react-native-blur';
import Animated, { Easing } from 'react-native-reanimated';
import { useNavigation } from '../navigation-hooks/Hooks';
import FadeTransition from './FadeTransition';
import usePromoPopover from './usePromoPopover';
import { boldPrimaryFontFace, primaryFontFace } from './Styles';
import { OnoThemeDark } from '../logic/OnoTheme';

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
function AsyncButton({ onPress, ...props }) {
  const [isLoading, setIsLoading] = React.useState(false);
  function handlePress() {
    setIsLoading(true);
    onPress().finally(() => {
      setIsLoading(true);
    });
  }
  return (
    <SpinnerButton {...props} onPress={handlePress} isLoading={isLoading} />
  );
}

function AnimateyCreditCard({ ready, isDone, isCardInserted }) {
  const [position] = useState(new Animated.Value(0));

  useEffect(() => {
    const isReady = !isDone ? true : ready;
    if (isCardInserted) {
      Animated.timing(position, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.cubic),
      }).start(evt => {});
    } else if (isReady) {
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
  }, [ready, isDone, isCardInserted]);

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
  error,
  paymentState,
  paymentSuccessful,
  paymentCompleted,
  paymentErrorMessage,
  paymentDisplayMessage,
  onPromoCode,
  ...props
}) {
  // console.log('---- =======');
  // console.log(`---- errorStep: ${JSON.stringify(readerState.errorStep)}`);
  // console.log(`---- inputOptions: ${JSON.stringify(readerState.inputOptions)}`);
  // console.log(`---- status: ${JSON.stringify(readerState.status)}`);
  // console.log(`---- promptType: ${JSON.stringify(readerState.promptType)}`);
  // console.log(`---- isCollecting: ${JSON.stringify(readerState.isCollecting)}`);
  // console.log(`---- errorCode: ${JSON.stringify(readerState.errorCode)}`);
  // console.log(
  //   `---- errorDeclineCode: ${JSON.stringify(readerState.errorDeclineCode)}`,
  // );
  // console.log(
  //   `---- isCardInserted: ${JSON.stringify(readerState.isCardInserted)}`,
  // );

  const {
    inputOptions,
    status,
    promptType,
    isCollecting,
    cardInserted,
    paymentStatus,
    readerError,
    connectionStatus,
    connectedReader,
    readerInputOptions,
    readerInputPrompt,
  } = paymentState;
  console.log('========= paymentState');
  console.log({
    readerState,
    paymentState,
    paymentSuccessful,
    paymentCompleted,
    paymentErrorMessage,
    paymentDisplayMessage,
  });
  // function hasInputOption(name) {
  //   return (
  //     status === 'CollectingPaymentMethod' &&
  //     inputOptions &&
  //     inputOptions.indexOf(name) !== -1
  //   );
  // }
  // if (
  //   isCollecting &&
  //   !isCardInserted &&
  //   hasInputOption('InsertCard') &&
  //   hasInputOption('TapCard')
  // ) {
  //   message = 'insert card or tap payment';
  // } else if (isCollecting && !isCardInserted && hasInputOption('InsertCard')) {
  //   message = 'insert card';
  // }

  // if (!message && promptType === 'TryAnotherReadMethod') {
  //   message = 'try another payment method';
  // }

  // if (!message && status === 'CollectingPaymentIntent') {
  //   message = 'please wait.';
  // }

  // if (!message && status === 'NotReady') {
  //   message = 'please wait.';
  // }

  // if (!message && errorStep === 'confirmPaymentIntent' && errorCode === 103) {
  //   message = 'card declined ' + errorDeclineCode;
  // }

  let message = null;

  if (!message && !paymentCompleted && paymentStatus === 2 && !cardInserted) {
    message = 'insert card or tap payment';
  }

  if (!message && cardInserted && paymentSuccessful && !paymentCompleted) {
    message = 'thanks, please remove card';
  }

  if (!message && !paymentSuccessful && !paymentCompleted && readerError) {
    message = readerError;
  }

  // message = `p: ${
  //   paymentState.paymentStatus
  // } cardInserted: ${cardInserted} isCompleted: ${!!paymentCompleted}`;
  // }

  if (!message && paymentCompleted) {
    message = 'placing order..';
  }

  if (!message && paymentStatus === 3) {
    // message = 'please wait..';
    message = cardInserted ? 'thanks, please remove card' : 'placing order..';
  }

  if (!message) {
    message = '';
  }

  let bottomContent = (
    <AnimateyCreditCard
      isCardInserted={cardInserted}
      isDone={paymentCompleted}
    />
  );

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
        <AsyncButton
          title="confirm order"
          size="large"
          onPress={skipPayment}
          style={{ width: 200 }}
        />
      </View>
    );
  }

  if (error) {
    return (
      <FadeTransition
        backgroundColor={'#00000040'}
        themeOverride={OnoThemeDark}
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
            fontSize: 16,
            position: 'absolute',
            left: 0,
            right: 0,
            height: 70,
            textAlign: 'center',
            bottom: 300,
            ...boldPrimaryFontFace,
          }}
        >
          Oops! {error.message}
        </Text>
      </FadeTransition>
    );
  }

  return (
    <FadeTransition
      backgroundColor={'#00000040'}
      themeOverride={OnoThemeDark}
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
      <Receipt summary={summary} onPromoCode={onPromoCode} />
      {bottomContent}

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 70,
          textAlign: 'center',
          bottom: 270,
        }}
      >
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: message.length > 40 ? 22 : 36,
            ...primaryFontFace,
          }}
        >
          {message}
        </Text>
      </View>
    </FadeTransition>
  );
}

OrderConfirmPage.navigationOptions = FadeTransition.navigationOptions;
