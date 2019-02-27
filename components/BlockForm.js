import React from 'react';
import { View, Text } from 'react-native';

export default function BlockForm({ children }) {
  return (
    <View
      style={{
        flex: 1,
        width: 700,
        alignSelf: 'center',
        padding: 10,
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}
