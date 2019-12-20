import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../dash-ui/Theme';
import { opacify } from '../dash-ui/utils';

export function CodeBlock({ children }) {
  const theme = useTheme();
  // const borderColor = opacify(theme.backgroundColor, 0.5);
  const borderColor = theme.backgroundColor;
  return (
    <View
      style={{
        backgroundColor: theme.colorBackground,
        borderRadius: 4,
        borderColor: borderColor,
        borderWidth: 1,
        marginVertical: 16,
      }}
    >
      {children}
    </View>
  );
}

export function CodeBlockTitle({ title = 'default title' }) {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: theme.colorBackground,
      }}
    >
      <Text style={{ fontSize: 14, color: theme.colorForeground }}>
        {title}
      </Text>
    </View>
  );
}

export function CodeBlockExample({ children }) {
  const theme = useTheme();
  // const borderColor = opacify(theme.backgroundColor, 0.5);
  const borderColor = theme.backgroundColor;
  return (
    <View
      style={{
        padding: 16,
        borderTopColor: borderColor,
        backgroundColor: theme.colorBackground,
        borderTopWidth: 1,
      }}
    >
      {children}
    </View>
  );
}

export function CodeBlockBody({ children }) {
  const theme = useTheme();
  // const borderColor = opacify(theme.backgroundColor, 0.5);
  const borderColor = theme.backgroundColor;
  return (
    <View
      style={{
        padding: 16,
        borderTopColor: borderColor,
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
