import React from 'react';
import { Text } from 'react-native';
import { blockFormMessageTextStyle } from '../../components/Styles';

export default function BlockFormMessage({ message }) {
  return (
    <Text style={{ marginHorizontal: 10, ...blockFormMessageTextStyle }}>
      {message}
    </Text>
  );
}
