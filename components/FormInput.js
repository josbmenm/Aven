import React, { useEffect, useState } from 'react';
import { View, TextInput, Animated, Easing } from 'react-native';
// import { TextInputMask } from 'react-native-masked-text';
import { textInputLabelStyle, textInputStyle, monsterra60 } from './Styles';
// import Animated, { Easing } from 'react-native-reanimated';

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
  let Input = TextInput;
  let inputType = undefined;
  let inputOptions = undefined;
  let inputRef = ref;
  let valueHandler = onValue;
  // let valueHandler = onValue;
  if (mode === 'phone') {
    Input = TextInput;
    inputType = 'custom';
    inputOptions = {
      mask: '(999) 999-9999',
    };
    inputRef = i => {
      ref.current = i && i.getElement();
    };
    valueHandler = onValue;
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
          zIndex: -1,
          fontSize: placeholderOpenProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [13, 28],
          }),
          transform: [
            {
              translateY: placeholderOpenProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0],
              }),
            },
          ],
        }}
      >
        {label}
      </Animated.Text>
      <Input
        enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
        keyboardAppearance="dark"
        keyboardType={keyboardType}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        ref={inputRef}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChangeText={valueHandler}
        options={inputOptions}
        type={inputType}
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
