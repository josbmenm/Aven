import { Text, View } from 'react-native';
import React from 'react';

export function SubSection({ title, children }) {
  return (
    <View>
      <Text style={{ fontSize: 32 }}>{title}</Text>
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

export function Title({ children }) {
  return <Text>{children}</Text>;
}

export function List({ children }) {
  return <Text>{children}</Text>;
}
export function Body({ children }) {
  return <Text>{children}</Text>;
}

export function Link({ children }) {
  return <Text>{children}</Text>;
}
export function Bold({ children }) {
  return <Text style={{ fontWeight: 'bold' }}>{children}</Text>;
}

export function ListItem({ children }) {
  return <Text>{children}</Text>;
}
