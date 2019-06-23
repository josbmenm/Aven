import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../dashboard/Theme'
import BodyText from './BodyText';


export function SubSection({ title, children }) {
  return (
    <View style={{ marginVertical: 40 }}>
      {title ? <Title style={{ marginBottom: 24 }}>{title}</Title> : null}
      {children}
    </View>
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
