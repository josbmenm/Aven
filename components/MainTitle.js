import React from 'react';
import { Text, View } from 'react-native';
import { titleStyle, boldPrimaryFontFace, monsterra60 } from './Styles';

export default function MainTitle({ children, subtitle }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <Text
        style={{
          ...titleStyle,
          fontSize: 36,
          letterSpacing: 0,
        }}
      >
        {children}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: 16,
            color: monsterra60,
            ...boldPrimaryFontFace,
            alignSelf: 'flex-end',
            marginBottom: 9,
            marginLeft: 12,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
