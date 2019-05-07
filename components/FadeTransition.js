import React from 'react';
import Animated, { Easing } from 'react-native-reanimated';

import { StyleSheet } from 'react-native';
const { Value, timing, interpolate, View } = Animated;

export default class FadeTransition extends React.Component {
  static navigationOptions = {
    createTransition: transition => {
      const progress = new Value(0);
      return { ...transition, progress };
    },
    runTransition: async (transition, screenRefs, fromState, toState) => {
      await new Promise((resolve, reject) => {
        const isVisible = !!toState.routes.find(
          route => route.key === transition.transitionRouteKey,
        );
        const toValue = isVisible ? 1 : 0;
        const baseEase = Easing.poly(3);
        timing(transition.progress, {
          easing: baseEase,
          duration: 300,
          toValue,
        }).start(
          () => {
            resolve();
          },
          e => {
            console.error('wot', e);
            reject(e);
          },
        );
      });
    },
  };
  render() {
    const {
      transition,
      background,
      transitionRef,
      disableTransform,
      children,
    } = this.props;
    let progress = 1;
    if (transition) {
      progress = transition.progress;
    }
    let innerTransform = [];
    if (disableTransform !== true) {
      innerTransform = [
        {
          translateY: interpolate(progress, {
            inputRange: [0, 0.5, 1],
            outputRange: [100, 100, 0],
          }),
        },
      ];
    }
    return (
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        {...this.props}
        ref={transitionRef}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity: interpolate(progress, {
              inputRange: [0, 0.75, 1],
              outputRange: [0, 1, 1],
            }),
          }}
        >
          {background}
        </View>

        <View
          style={{
            flex: 1,
            opacity: interpolate(progress, {
              inputRange: [0, 0.7, 1],
              outputRange: [0, 0, 1],
            }),
            transform: innerTransform,
          }}
        >
          {children}
        </View>
      </View>
    );
  }
}
