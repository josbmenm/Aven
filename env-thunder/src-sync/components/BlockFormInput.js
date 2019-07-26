import React, { useEffect, useState } from 'react';
import { View, TextInput, Animated, Easing } from 'react-native';
import { monsterra60 } from './Styles';
import { useTheme } from '../dashboard/Theme';

function BlockFormInputWithRef(
  { value, onValue, label, mode, onSubmit, onFocus, onBlur, upperCase, style },
  ref,
  ...rest
) {
  const theme = useTheme();
  const desiredPlaceholderOpen = value ? 0 : 1;
  const inputOpacity = new Animated.Value(0);
  const [focus, setFocus] = React.useState(0);
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

  useEffect(() => {
    Animated.timing(inputOpacity, {
      toValue: focus,
      duration: 200,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [focus]);

  function handleFocus(e) {
    e.persist();
    setFocus(1);
    onFocus && onFocus(e);
  }

  function handleBlur(e) {
    e.persist();
    setFocus(0);
    onBlur && onBlur(e);
  }

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
  let multiline = false;
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
  } else if (mode === 'textarea') {
    multiline = true;
  }
  return (
    <Animated.View style={{
      padding: 4,
      margin: -4,
      borderRadius: 4,
      backgroundColor: inputOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: ["rgba(204, 221, 220, 0)", "rgba(204, 221, 220, 1)"]
      }),
      flex: 1,
      ...style,
    }}>
      <View
        style={{
          flex: 1,
          borderRadius: 4,
          borderColor: monsterra60,
          borderWidth: 3,
          paddingTop: 20,
          paddingBottom: 8,
          paddingHorizontal: 20,
          backgroundColor: 'white',
        }}
        {...rest}
      >
        <Animated.Text
          style={{
            fontFamily: theme.fonts.regular,
            position: 'absolute',
            color: theme.colors.monsterras[1],
            left: 20,
            right: 20,
            zIndex: -1,
            fontSize: placeholderOpenProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 18],
            }),
            transform: [
              {
                translateY: placeholderOpenProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-18, 0],
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
          multiline={multiline}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={valueHandler}
          options={inputOptions}
          type={inputType}
          onSubmitEditing={onSubmit}
          style={{
            fontSize: 18,
            outline: 'none',
            lineHeight: 28,
            color: theme.colors.monsterra,
            // ...textInputStyle,
            ...(mode === 'description' ? { height: 120 } : {}),
            ...(mode === 'textarea' ? { height: 200 } : {}),
          }}
        />
      </View>
    </Animated.View>
  );
}

const BlockFormInput = React.forwardRef(BlockFormInputWithRef);

export default BlockFormInput;