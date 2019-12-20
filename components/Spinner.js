import Animated, { Easing } from 'react-native-reanimated';
import React from 'react';
import { useTheme } from '../dash-ui/Theme';

export default function Spinner({ color, isSpinning = true, style }) {
  const theme = useTheme();

  const [spinPosition] = React.useState(new Animated.Value(0));
  const [opacity] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: isSpinning ? 1 : 0,
      duration: 500,
      easing: Easing.inOut(Easing.quad),
    }).start();
  }, [isSpinning]);

  React.useEffect(() => {
    Animated.timing(spinPosition, {
      toValue: 1,
      duration: 9000000,
      easing: Easing.linear,
    }).start();
  }, []);
  return (
    <Animated.Image
      style={{
        opacity,
        width: '80%',
        height: '80%',
        maxWidth: 36,
        maxHeight: 36,
        tintColor: color || theme.colorTint,
        transform: [
          {
            rotateZ: Animated.interpolate(spinPosition, {
              inputRange: [0, 1],
              outputRange: [0, 36000],
            }),
          },
        ],
        ...style,
      }}
      source={require('./assets/Spinner.png')}
    />
  );
}
