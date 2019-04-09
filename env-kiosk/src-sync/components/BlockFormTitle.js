import React from 'react';
import { Text } from 'react-native';
import { blockFormTitleTextStyle } from './Styles';

export default function BlockFormTitle({ title }) {
  return (
    <Text style={{ marginHorizontal: 10, ...blockFormTitleTextStyle }}>
      {title}
    </Text>
  );
}
