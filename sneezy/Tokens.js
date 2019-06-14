import { Text, View } from 'react-native';
import React from 'react';
import { useTheme } from './ThemeContext';

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

export function Heading({ children, style, ...rest }) {
  const theme = useTheme();
  return <Text style={{ ...theme.textStyles.heading, ...style }} {...rest}>{children}</Text>;
}

export function Title({ children, style, ...rest }) {
  const theme = useTheme();
  return <Text style={{ ...theme.textStyles.title, ...style }} {...rest}>{children}</Text>;
}

export function List({ children }) {
  return <Text>{children}</Text>;
}

export function BodyText({ children, bold, style, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Text style={{ ...theme.textStyles.body, ...style, ...boldStyle }} {...rest}>{children}</Text>
  );
}

export function FootNote({ children, bold, style, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Text style={{ ...theme.textStyles.footnote, ...style, ...boldStyle }} {...rest}>
      {children}
    </Text>
  );
}

export function Link({ children }) {
  return <Text>{children}</Text>;
}

export function ListItem({ children }) {
  return <Text>{children}</Text>;
}
