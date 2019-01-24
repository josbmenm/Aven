import React from 'react';
import Animated, { Easing } from 'react-native-reanimated';
import {
  SharedTransition,
  sharedNavigationOptionsWithConfig,
} from '../../navigation-transitioner/Shared';
const { Value, timing, interpolate } = Animated;

export default class FadeTransition extends React.Component {
  static navigationOptions = sharedNavigationOptionsWithConfig({
    duration: 400,
  });
  render() {
    const {
      transition,
      backgroundColor,
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
      <SharedTransition
        style={{
          flex: 1,
          backgroundColor,
          opacity: interpolate(progress, {
            inputRange: [0, 0.75, 1],
            outputRange: [0, 1, 1],
          }),
        }}
        {...this.props}
        ref={transitionRef}
      >
        {background}
        <Animated.View
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
        </Animated.View>
      </SharedTransition>
    );
  }
}
