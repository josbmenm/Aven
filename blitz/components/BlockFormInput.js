import React, { useEffect, useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import {
  textInputContainerStyle,
  textInputLabelStyle,
  textInputStyle,
} from '../../components/Styles';
import Animated, { Easing } from 'react-native-reanimated';

const textInputFontSize = 26;

function BlockFormInputWithRef(
  { value, onValue, label, mode, onSubmit, onFocus, onBlur },
  ref,
) {
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
  const autoCorrect = false;
  let autoComplete = null;
  let keyboardType = 'default';
  let enablesReturnKeyAutomatically = true;
  if (mode === 'phone') {
    keyboardType = 'phone-pad';
  } else if (mode === 'email') {
    keyboardType = 'email-address';
  } else if (mode === 'name') {
    autoComplete = 'words';
  }
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
        enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
        keyboardAppearance="dark"
        keyboardType={keyboardType}
        autoCorrect={autoCorrect}
        autoCapitalize={autoComplete}
        ref={ref}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChangeText={onValue}
        onSubmitEditing={onSubmit}
        style={{ fontSize: textInputFontSize, ...textInputStyle }}
      />
    </View>
  );
}

const BlockFormInput = React.forwardRef(BlockFormInputWithRef);

export default BlockFormInput;
