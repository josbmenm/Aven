import React from 'react';
import { Text } from 'react-native';
import Row from './Row';
import { genericText } from './Styles';

export default function TextRow({ text, ...rowProps }) {
  return (
    <Row {...rowProps}>
      <Text
        style={{
          ...genericText,
        }}
      >
        {text}
      </Text>
    </Row>
  );
}
