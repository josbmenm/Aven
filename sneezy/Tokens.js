import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../dashboard/Theme'
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

export function StyledButton({
  buttonStyle,
  titleStyle,
  title,
  type = "solid",
  disabled,
  ...rest
}) {
  const theme = useTheme();
  return (
    <View
      style={[{
        borderRadius: 4,
        borderWidth: 3,
        paddingVertical: theme.spaces[4],
        paddingHorizontal: theme.spaces[8],
        justifyContent: 'center',
        borderColor: type === 'outline' ? theme.colors.primary80 : 'transparent',
        backgroundColor:
          type === 'solid' ? theme.colors.primary80 : 'transparent',
        cursor: disabled ? "no-drop" : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }, buttonStyle]}
      {...rest}
    >
      <Text
        style={[
          {
            fontFamily: theme.fontFamily.button,
            fontSize: theme.fontSizes[2],
            textAlign: 'center',
            lineHeight: theme.fontSizes[2] * 1.2,
            color: type === 'solid' ? theme.colors.white : theme.colors.primary,
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

export function Button({
  buttonStyle,
  title = 'button',
  type = 'solid', // solid | outline
  variant = 'primary', // primary | secondary
  titleStyle,
  routeName,
  url,
  ...rest
}) {
  return (
    <FunctionalLink
      routeName={routeName}
      url={url}
      renderContent={active => (
        <StyledButton
          type={type}
          active={active}
          buttonStyle={buttonStyle}
          titleStyle={titleStyle}
          title={title}
          {...rest}
        />
      )}
    />
  );
}

export function Link({
  buttonStyle = {},
  titleStyle = {},
  title = 'link',
  size = 'Small',
  routeName,
  url,
  noActive = false,
  ...rest
}) {
  const theme = useTheme();
  return (
    <FunctionalLink
      routeName={routeName}
      url={url}
      renderContent={active => (
        <StyledButton
          title={title}
          buttonStyle={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderColor: 'transparent',
            borderBottomWidth: 3,
            borderColor: noActive
              ? 'transparent'
              : active
              ? theme.colors.primary
              : 'transparent',
            ...buttonStyle,
          }}
          type="outline"
          titleStyle={{
            color: theme.colors.primary,
            fontSize: size === 'Small' ? 16 : 24,
            ...titleStyle,
          }}
        />
      )}
    />
  );
}
