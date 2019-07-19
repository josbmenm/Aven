import React from 'react';
import { View } from 'react-native';

export default function BlockFormRow({ children }) {
  return (
    <View style={{ marginVertical: 10, flexDirection: 'row' }}>{children}</View>
  );
}
