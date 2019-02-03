import React, { useState, useEffect, createContext } from 'react';
import { View } from 'react-native';
import TextButton from '../../components/TextButton';
import { useOrderSummary, useOrder } from '../../ono-cloud/OnoKitchen';
import CartSidebar from '../../components/CartSidebar';

import { useNavigation } from '../../navigation-hooks/Hooks';
import useEmptyOrderEscape from '../useEmptyOrderEscape';
import {
  prettyShadow,
  rightSidebarWidth,
  headerHeight,
  prettyShadowRespectedRadius,
  pageBackgroundColor,
} from '../../components/Styles';
import Animated, { Easing } from 'react-native-reanimated';
import FadeTransition from './FadeTransition';
const { interpolate } = Animated;

export const SidebarOverlayContext = createContext({});

export default function OrderSidebarPage({ children, ...props }) {
  const { navigate } = useNavigation();
  const summary = useOrderSummary();
  const { cancelOrder } = useOrder();
  useEmptyOrderEscape();
  const [openProgress] = useState(new Animated.Value(0));
  const shouldBeOpen = !!summary && summary.items && summary.items.length >= 1;
  useEffect(
    () => {
      Animated.timing(openProgress, {
        duration: 1000,
        easing: Easing.out(Easing.poly(5)),
        toValue: shouldBeOpen ? 1 : 0,
        useNativeDriver: true,
      }).start();
    },
    [shouldBeOpen],
  );

  const panel = summary && <CartSidebar summary={summary} />;

  return (
    <FadeTransition
      backgroundColor={pageBackgroundColor}
      {...props}
      disableTransform
    >
      <SidebarOverlayContext.Provider
        value={{ openProgress, width: rightSidebarWidth }}
      >
        {children}
      </SidebarOverlayContext.Provider>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: rightSidebarWidth,
          backgroundColor: '#fff',
          transform: [
            {
              translateX: interpolate(openProgress, {
                inputRange: [0, 1],
                outputRange: [
                  rightSidebarWidth + prettyShadowRespectedRadius,
                  0,
                ],
              }),
            },
          ],
          ...prettyShadow,
        }}
      >
        {panel}
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: headerHeight,
          width: rightSidebarWidth,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
        pointerEvents="box-none"
      >
        <TextButton
          title="cancel order"
          onLongPress={() => {
            navigate('Home');
          }}
          onPress={async () => {
            await cancelOrder();
            navigate('KioskHome');
          }}
        />
      </View>
    </FadeTransition>
  );
}

OrderSidebarPage.navigationOptions = FadeTransition.navigationOptions;
