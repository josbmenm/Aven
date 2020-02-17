import React from 'react';
import { Text } from 'react-native';

export default function Title({ children }) {
  return (
    <Text style={{ margin: 30, fontSize: 72, color: '#789' }}>{children}</Text>
  );
}
