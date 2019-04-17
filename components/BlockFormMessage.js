import React from 'react';
import { Text } from 'react-native';
import { blockFormMessageTextStyle } from './Styles';

export default function BlockFormMessage({ message }) {
  return (
    <Text style={{ marginHorizontal: 10, ...blockFormMessageTextStyle }}>
      {message}
    </Text>
  );
}