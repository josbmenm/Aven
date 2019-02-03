import React from 'react';
import { Text } from 'react-native';
import { descriptionTextStyle } from '../../components/Styles';

export default function DescriptionText({ children }) {
  return (
    <Text
      style={{
        marginTop: 2,
        ...descriptionTextStyle,
      }}
    >
      {children}
    </Text>
  );
}
