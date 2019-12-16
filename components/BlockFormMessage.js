import React from 'react';
import { Text } from 'react-native';
import Heading from '../ui-library/composite/Heading'
import { blockFormMessageTextStyle } from './Styles';
import { Spacing } from '../ui-library/Theme';

export default function BlockFormMessage({ message }) {
  return (
    <Spacing horizontal={8}>
      <Heading theme={{
        headingFontSize:
      }}
    <Text style={{ marginHorizontal: 10, ...blockFormMessageTextStyle }}>
      {message}
    </Text>
    </Spacing>
  );
}
