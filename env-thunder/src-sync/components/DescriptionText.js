import React from 'react';
import { Text } from 'react-native';
import { descriptionTextStyle } from './Styles';

export default function DescriptionText({ children }) {
  return (
    <Text
      style={{
        marginTop: 24,
        ...descriptionTextStyle,
      }}
    >
      {children}
    </Text>
  );
}
