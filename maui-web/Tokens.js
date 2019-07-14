import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../dashboard/Theme'
import Text from '../dashboard/Text';
import Heading from '../dashboard/Heading';


export function SubSection({ title, children }) {
  return (
    <View style={{ marginVertical: 40 }}>
      {title ? <Heading size="small" style={{ marginBottom: 24 }}>{title}</Heading> : null}
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
      <Text size="large">{children}</Text>
    </View>
  );
}