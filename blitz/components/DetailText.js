import React from 'react';
import { Text } from 'react-native';
import { detailTextStyle } from '../../components/Styles';

export default function DetailText({ children }) {
  return (
    <Text
      style={{
        ...detailTextStyle,
        marginTop: 16,
      }}
    >
      {children}
    </Text>
  );
}
