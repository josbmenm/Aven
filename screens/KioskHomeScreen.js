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
import { useRestaurantState, useIsRestaurantOpen } from '../ono-cloud/Kitchen';
import FadeTransition from '../components/FadeTransition';
import { useNavigation } from '../navigation-hooks/Hooks';

function KioskHomeContent({ isOpen, onStartOrder }) {
  const message = isOpen
    ? 'tap to start your order'
    : 'now closed. come find us again soon!';
  return (
    <TouchableWithoutFeedback onPress={onStartOrder}>
      <View style={{ flex: 1, justifyContent: 'center', ...genericPageStyle }}>
        {isOpen && (
          <Image
            style={{
              width: '100%',
              height: 200,
              resizeMode: 'contain',
              tintColor: highlightPrimaryColor,
            }}
            source={require('../components/assets/OnoBlendsLogo.png')}
          />
        )}

        <Text
          style={{
            ...splashText,
            textAlign: 'center',
            marginVertical: 40,
          }}
        >
          {message}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default function KioskHomeScreen({ navigation, ...props }) {
  const { resetOrder, startOrder } = useOrder();
  useEffect(() => {
    resetOrder();
  }, []);
  const [restaurantState] = useRestaurantState();
  const { isOpen, closingSoon } = useIsRestaurantOpen(restaurantState);

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
      <KioskHomeContent
        isOpen={isOpen}
        onStartOrder={() => {
          if (isOpen) {
            startOrder().then(() => {
              navigation.navigate('ProductHome');
            });
          }
        }}
        closingSoon={closingSoon}
      />
    </FadeTransition>
  );
}

KioskHomeScreen.navigationOptions = FadeTransition.navigationOptions;
