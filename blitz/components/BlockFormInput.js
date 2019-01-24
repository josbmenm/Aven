import React, { useEffect, useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import {
  textInputContainerStyle,
  textInputLabelStyle,
  textInputStyle,
} from '../../components/Styles';
import Animated, { Easing } from 'react-native-reanimated';

const textInputFontSize = 26;

function BlockFormInputWithRef({ value, onValue, label }, ref) {
  const desiredPlaceholderOpen = value ? 0 : 1;
  const [placeholderOpenProgress] = useState(
    new Animated.Value(desiredPlaceholderOpen),
  );
  useEffect(
    () => {
      Animated.timing(placeholderOpenProgress, {
        toValue: desiredPlaceholderOpen,
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }).start();
    },
    [desiredPlaceholderOpen],
  );
  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: 10,
        borderWidth: 1,
        ...textInputContainerStyle,
      }}
    >
      <Animated.Text
        style={{
          ...textInputLabelStyle,
          position: 'absolute',
          left: 0,
          right: 0,
          fontSize: Animated.interpolate(placeholderOpenProgress, {
            inputRange: [0, 1],
            outputRange: [13, 28],
          }),
          transform: [
            {
              translateY: Animated.interpolate(placeholderOpenProgress, {
                inputRange: [0, 1],
                outputRange: [7, 24],
              }),
            },
          ],
        }}
      >
        {label}
      </Animated.Text>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onValue}
        style={{ fontSize: textInputFontSize, ...textInputStyle }}
      />
    </View>
  );
}

const BlockFormInput = React.forwardRef(BlockFormInputWithRef);

export default BlockFormInput;
