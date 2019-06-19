import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';
import FunctionalLink from '../navigation-web/Link';

export function SubSection({ title, children }) {
  return (
    <View style={{ marginVertical: 40 }}>
      {title ? <Title style={{ marginBottom: 24 }}>{title}</Title> : null}
      {children}
    </View>
  );
}

export function Section({ title, children }) {
  return (
    <View>
      <Text style={{ fontSize: 32 }}>{title}</Text>
      {children}
    </View>
  );
}

export function Heading({ children, style, ...rest }) {
  const theme = useTheme();
  return (
    <Text style={{ ...theme.textStyles.heading, ...style }} {...rest}>
      {children}
    </Text>
  );
}

export function Title({ children, style, ...rest }) {
  const theme = useTheme();
  return (
    <Text style={{ ...theme.textStyles.title, ...style }} {...rest}>
      {children}
    </Text>
  );
}

export function List({ children }) {
  return (
    <View
      style={{
        marginLeft: 20,
      }}
    >
      {children}
    </View>
  );
}

export function ListItem({ children }) {
  const theme = useTheme();
  return (
    <View style={{ position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          width: 6,
          height: 6,
          borderRadius: 4,
          backgroundColor: theme.colors.primary,
          left: -20,
          top: 12,
        }}
      />
      <BodyText>{children}</BodyText>
    </View>
  );
}

export function BodyText({ children, bold, style, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Text
      style={{ ...theme.textStyles.body, ...style, ...boldStyle }}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function FootNote({ children, bold, style, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Text
      style={StyleSheet.flatten([
        { ...theme.textStyles.footnote, ...boldStyle },
        style,
      ])}
      {...rest}
    >
      {children}
    </Text>
  );
}

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
  url,
  ...rest
}) {
  const { colors, fonts } = useTheme();

  return (
    <FunctionalLink
      routeName={routeName}
      url={url}
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
  text = 'link',
  size = 'Small',
  routeName,
  url,
  noActive = false,
  ...rest
}) {
  const { colors, fonts } = useTheme();
  return (
    <FunctionalLink
      routeName={routeName}
      url={url}
      renderContent={active => (
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderBottomWidth: 3,
            borderColor: noActive
              ? 'transparent'
              : active
              ? colors.primary
              : 'transparent',
            ...buttonStyle,
          }}
          {...rest}
        >
          <Text
            style={StyleSheet.flatten([
              {
                fontWeight: 'bold',
                fontSize: size === 'Small' ? 16 : 24,
                fontFamily: fonts.button,
                color: colors.primary,
              },
              textStyle,
            ])}
          >
            {text}
          </Text>
        </View>
      )}
    />
  );
}
