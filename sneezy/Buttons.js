import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeContext';

const defaultButtonStyles = {
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    fontWeight: 'bold',
    fontFamily: 'Maax-Bold',
    fontSize: 20,
  },
};

export function Button({
  buttonStyle,
  text = 'button',
  onPress,
  type = 'solid', // solid | outline
  variant = 'primary', // primary | secondary
  textStyle = {},
  ...rest
}) {
  const [focusStyles, setFocusStyles] = React.useState({});
  const { colors } = useTheme();

  function onFocus() {
    setFocusStyles({
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
    });
  }

  function onBlur() {
    setFocusStyles({});
  }

  return (
    <TouchableOpacity onPress={onPress} onFocus={onFocus} onBlur={onBlur}>
      <View
        style={{
          ...defaultButtonStyles.button,
          borderRadius: 4,
          borderWidth: 3,
          borderColor: colors.primary,
          backgroundColor: type === 'solid' ? colors.primary : 'transparent',
          ...buttonStyle,
          ...focusStyles,
          cursor: 'pointer',
        }}
      >
        <Text
          style={{
            ...defaultButtonStyles.text,
            color: type === 'solid' ? colors.white : colors.primary,
            ...textStyle,
          }}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function Link({
  buttonStyle = {},
  textStyle = {},
  active = false,
  children,
  onPress,
  ...rest
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          ...defaultButtonStyles.button,
          borderBottomWidth: 3,
          borderColor: active ? colors.primary : 'transparent',
          ...buttonStyle,
        }}
      >
        <Text
          style={{
            ...defaultButtonStyles.text,
            color: colors.primary,
            ...textStyle,
          }}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
