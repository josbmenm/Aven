import React from 'react';
import { View } from 'react-native';

export default function FormSection({ children, direction = 'column' }) {
  return (
    <View style={{ marginBottom: 40, flexDirection: direction }}>{children}</View>
  );
}
