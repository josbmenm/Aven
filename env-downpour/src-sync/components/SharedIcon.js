import React from 'react';
import { Text } from 'react-native';

export default function SharedIcon({ style, icon, ...props }) {
  return (
    <Text
      style={{ color: style.color, fontSize: style.fontSize, ...props.style }}
    >
      {icon}
    </Text>
  );
}
