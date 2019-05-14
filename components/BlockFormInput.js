import React, { useEffect, useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { textInputLabelStyle, textInputStyle, monsterra60 } from './Styles';
import Animated, { Easing } from 'react-native-reanimated';

const textInputFontSize = 26;

function BlockFormInputWithRef(
  { value, onValue, label, mode, onSubmit, onFocus, onBlur, upperCase },
  ref,
) {
  const desiredPlaceholderOpen = value ? 0 : 1;
  const [placeholderOpenProgress] = useState(
    new Animated.Value(desiredPlaceholderOpen),
  );
  useEffect(() => {
    Animated.timing(placeholderOpenProgress, {
      toValue: desiredPlaceholderOpen,
      duration: 500,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [desiredPlaceholderOpen]);
  let autoCorrect = false;
  let secureTextEntry = false;
  let autoCapitalize = null;
  let keyboardType = 'default';
  let enablesReturnKeyAutomatically = true;
  if (mode === 'phone') {
    keyboardType = 'phone-pad';
  } else if (mode === 'password') {
    secureTextEntry = true;
    autoCapitalize = 'none';
  } else if (mode === 'description') {
    autoCorrect = true;
    autoCapitalize = 'sentences';
  } else if (mode === 'number') {
    keyboardType = 'number-pad';
  } else if (mode === 'email') {
    autoCapitalize = 'none';
    keyboardType = 'email-address';
  } else if (mode === 'name') {
    autoCapitalize = 'words';
  } else if (mode === 'code') {
    autoCapitalize = 'characters';
  }
  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: 10,
        borderWidth: 1,
        borderRadius: 4,
        paddingTop: 15,
        borderColor: monsterra60,
        borderWidth: 3,
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
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        ref={ref}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChangeText={onValue}
        onSubmitEditing={onSubmit}
        style={{
          fontSize: textInputFontSize,
          ...textInputStyle,
          ...(mode === 'description' ? { height: 120 } : {}),
        }}
      />
    </View>
  );
}

const BlockFormInput = React.forwardRef(BlockFormInputWithRef);

export default BlockFormInput;
