import React from 'react';
import { Text, View } from 'react-native';

export default function Tag({ title, color }) {
  return (
    <View
      style={{
        borderRadius: 40,
        backgroundColor: color,
        padding: 10,
        width: 150,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </View>
  );
}
