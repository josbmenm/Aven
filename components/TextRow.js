import React from 'react';
import { Text } from 'react-native';
import Row from './Row';

export default function TextRow({ text, ...rowProps }) {
  return (
    <Row {...rowProps}>
      <Text>{text}</Text>
    </Row>
  );
}
