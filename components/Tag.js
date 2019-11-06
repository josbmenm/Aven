import React from 'react';
import { Text, View } from 'react-native';
import { boldPrimaryFontFace } from './Styles';

export default function Tag({ title, color, style, size = 'regular' }) {
  let padding = 7;
  let paddingHorizontal = 14;
  let fontSize = 22;
  let minWidth = 150;

  if (size === 'small') {
    padding = 4;
    paddingHorizontal = 12;
    fontSize = 14;
    minWidth = null;
  }

  return (
    <View
      style={{
        borderRadius: 4,
        backgroundColor: color,
        padding,
        paddingHorizontal,
        minWidth,
        ...style,
      }}
    >
      <Text
        style={{
          ...boldPrimaryFontFace,
          color: 'white',
          fontSize,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </View>
  );
}

Tag.neutralColor = '#444';
Tag.negativeColor = '#722';
Tag.positiveColor = '#272';
Tag.warningColor = '#997200';
