import React from 'react';
import { Text, View } from 'react-native';
import { boldPrimaryFontFace } from './Styles';

export default function Tag({ title, color }) {
  return (
    <View
      style={{
        borderRadius: 4,
        backgroundColor: color,
        padding: 10,
        width: 150,
      }}
    >
      <Text
        style={{
          ...boldPrimaryFontFace,
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
