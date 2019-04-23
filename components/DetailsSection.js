import React from 'react';
import { View } from 'react-native';

export default function DetailsSection({ children }) {
  return (
    <View
      style={{
        width: 580,
        marginLeft: 20,
        backgroundColor: 'white',
        shadowColor: 'white',
        shadowOffset: { width: -20, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 40,
      }}
    >
      {children}
    </View>
  );
}
