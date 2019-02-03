import React from 'react';
import { Text } from 'react-native';
import { titleStyle } from '../../components/Styles';

export default function SmallTitle({ children }) {
  return (
    <Text
      style={{
        fontSize: 24,
        marginTop: 24,
        ...titleStyle,
      }}
    >
      {children}
    </Text>
  );
}
