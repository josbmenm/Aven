import React, { useState, useRef, useEffect } from 'react';
import Animated, { Easing } from 'react-native-reanimated';
import TextButton from './TextButton';
import { headerHeight, rightSidebarWidth } from './Styles';
import { useNavigationWillBlurEffect } from '../navigation-hooks/Hooks';

export default function CountdownDoneButton({
  duration = 10,
  onLongPress,
  onPress,
}) {
  let [countdown, setCountdown] = useState(duration);
  let [opacity] = useState(new Animated.Value(duration >= 12 ? 0 : 1));
  let countRef = useRef({
    timeout: null,
  });
  useNavigationWillBlurEffect(() => {
    clearTimeout(countRef.current.timeout);
  });
  useEffect(() => {
    Animated.timing(opacity, {
      duration: 500,
      easing: Easing.cubic,
      toValue: countdown >= 12 ? 0 : 1,
    }).start();
    countRef.current.timeout = setTimeout(() => {
      if (countdown === 0) {
        onPress();
      } else {
        const nextCount = countdown - 1;
        setCountdown(nextCount);
      }
    }, 1000);
    return () => {
      clearTimeout(countRef.current.timeout);
    };
  }, [countdown]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        height: headerHeight,
        width: rightSidebarWidth,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        opacity,
      }}
      pointerEvents="box-none"
    >
      <TextButton
        title={`done (${countdown})`}
        onLongPress={onLongPress}
        onPress={onPress}
      />
    </Animated.View>
  );
}
