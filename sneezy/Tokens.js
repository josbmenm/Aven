import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../dashboard/Theme'
import UIButton from '../dashboard/UIButton';
import FunctionalLink from '../navigation-web/Link';


export function SubSection({ title, children }) {
  return (
    <View style={{ marginVertical: 40 }}>
      {title ? <Title style={{ marginBottom: 24 }}>{title}</Title> : null}
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

export function ButtonLink({
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
        <UIButton
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
        <UIButton
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

export function Tag({ title, style, ...rest }) {
  const theme = useTheme();
  return (
    <FootNote
      bold
      style={[{
        fontSize: 10,
        textTransform: 'uppercase',
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 16,
        borderRadius: 4,
        backgroundColor: theme.colors.primary70,
        color: theme.colors.white,
        minWidth: 120,
        textAlign: 'center',
        letterSpacing: 3,
      }, style]}
      {...rest}
    >
      {title}
    </FootNote>
  );
}
