import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeContext';
import FunctionalLink from '../navigation-web/Link';

export const defaultButtonStyles = {
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
};

export function Button({
  buttonStyle,
  text = 'button',
  type = 'solid', // solid | outline
  variant = 'primary', // primary | secondary
  textStyle = {},
  routeName,
  ...rest
}) {
  const { colors, fonts } = useTheme();

  return (
    <FunctionalLink
      routeName={routeName}
      renderContent={active => (
        <View
          style={{
            ...defaultButtonStyles.button,
            borderRadius: 4,
            borderWidth: 3,
            borderColor: colors.primary,
            backgroundColor: type === 'solid' ? colors.primary : 'transparent',
            ...buttonStyle,
            cursor: 'pointer',
          }}
        >
          <Text
            style={{
              ...defaultButtonStyles.text,
              color: type === 'solid' ? colors.white : colors.primary,
              fontFamily: fonts.button,
              ...textStyle,
            }}
          >
            {text}
          </Text>
        </View>
      )}
    />
  );
}

export function Link({
  buttonStyle = {},
  textStyle = {},
  text = "link",
  routeName,
  noActive = false,
  ...rest
}) {
  const { colors, fonts } = useTheme();
  return (
    <FunctionalLink
      routeName={routeName}
      renderContent={active => (
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderBottomWidth: 3,
            borderColor: noActive ? "transparent" : active ? colors.primary : 'transparent',
            ...buttonStyle,
          }}
          {...rest}
        >
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              fontFamily: fonts.button,
              color: colors.primary,
              ...textStyle,
            }}
          >
            {text}
          </Text>
        </View>
      )}
    />
  );
}
