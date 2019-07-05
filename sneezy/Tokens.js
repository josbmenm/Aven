import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../dashboard/Theme'
import BodyText from './BodyText';
import Title from './Title';


export function SubSection({ title, children }) {
  return (
    <View style={{ marginVertical: 40 }}>
      {title ? <Title style={{ marginBottom: 24 }}>{title}</Title> : null}
      {children}
    </View>
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
          backgroundColor: theme.colors.monsterra,
          left: -20,
          top: 12,
        }}
      />
      <BodyText>{children}</BodyText>
    </View>
  );
}
