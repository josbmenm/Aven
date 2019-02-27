import React from 'react';
import { Text } from 'react-native';
import { titleStyle } from './Styles';

export default function MainTitle({ children }) {
  return (
    <Text
      style={{
        fontSize: 36,
        ...titleStyle,
      }}
    >
      {children}
    </Text>
  );
}
