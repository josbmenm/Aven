import React from 'react';
import { View } from 'react-native';

export default function BlockForm({ children }) {
  return (
    <View style={{ marginVertical: 10, flexDirection: 'row' }}>{children}</View>
  );
}
