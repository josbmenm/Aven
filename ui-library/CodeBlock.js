import React from 'react';
import { View, Text } from 'react-native';

export function CodeBlock({ children }) {
  return (
    <View
      style={{
        backgroundColor: '#fefefe',
        borderRadius: 4,
        borderColor: '#dadada',
        borderWidth: 1,
        marginVertical: 16,
      }}
    >
      {children}
    </View>
  );
}

export function CodeBlockTitle({ title = 'default title' }) {
  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 14, color: '#666666' }}>{title}</Text>
    </View>
  );
}

export function CodeBlockExample({ children }) {
  return (
    <View
      style={{
        padding: 16,
        borderTopColor: '#dadada',
        borderTopWidth: 1,
      }}
    >
      {children}
    </View>
  );
}

export function CodeBlockBody({ children }) {
  return (
    <View
      style={{
        padding: 16,
        borderTopColor: '#dadada',
        borderTopWidth: 1,
      }}
    >
      <Text>{children}</Text>
    </View>
  );
}

export function CodeBlockProps({ component }) {
  return (
    <View style={{ padding: 16 }}>
      <Text>Props here...</Text>
    </View>
  );
}
