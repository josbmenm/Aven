import React from 'react';
import { Text } from 'react-native';
import { titleStyle } from '../../components/Styles';

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
