import React from 'react';
import { Text, View } from 'react-native';
import { boldPrimaryFontFace } from './Styles';

export default function Tag({ title, color, style }) {
  return (
    <View
      style={{
        borderRadius: 4,
        backgroundColor: color,
        padding: 7,
        paddingHorizontal: 14,
        minWidth: 150,
        ...style,
      }}
    >
      <Text
        style={{
          ...boldPrimaryFontFace,
          color: 'white',
          fontSize: 22,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </View>
  );
}

Tag.negativeColor = '#722';
Tag.positiveColor = '#272';
Tag.warningColor = '#997200';
