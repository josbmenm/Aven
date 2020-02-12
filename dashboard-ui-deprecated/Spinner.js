import React from 'react'
import { Animated } from 'react-native';

function spinIndefinitely(position) {
  Animated.timing(position, {
    toValue: 1,
    duration: 1000,
  }).start(evt => {
    if (evt.finished) {
      position.setValue(0);
      Animated.timing(position, {
        toValue: 1,
        duration: 1000,
      }).start(evt => {
        if (evt.finished) {
          position.setValue(0);
          spinIndefinitely(position);
        }
      });
    }
  });
}

function Spinner() {
  const [position] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(position, {
      toValue: 1,
      duration: 1000,
    }).start(evt => {
      if (evt.finished) {
        position.setValue(0);
        spinIndefinitely(position);
      }
    });
  }, []);

  let rotate = position.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '359deg'],
  });

  return (
    <Animated.View
      style={{ padding: 5, alignItems: 'center', transform: [{ rotate }] }}
    >
      <svg width={18} height={17}>
        <path
          d="M13.026-.052a9 9 0 1 1-8.052 0l.895 1.79a7 7 0 1 0 6.262 0l.895-1.79z"
          fill="#FFF"
        />
      </svg>
    </Animated.View>
  );
}

export default Spinner
