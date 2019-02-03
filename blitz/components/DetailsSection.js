import React from 'react';
import { View } from 'react-native';

export default function DetailsSection({ children }) {
  return <View style={{ width: 580, marginLeft: 20 }}>{children}</View>;
}
