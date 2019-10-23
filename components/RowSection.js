import React from 'react';
import { View, Text } from 'react-native';
import {
  rowSectionStyle,
  rowSectionInnerStyle,
  boldPrimaryFontFace,
} from './Styles';

const RowSection = ({ children, title, style }) => {
  return (
    <View style={{ ...style }}>
      {title && (
        <Text
          style={{
            ...boldPrimaryFontFace,
            color: '#282828',
            padding: 25,
            fontSize: 22,
          }}
        >
          {title}
        </Text>
      )}
      <View style={{ ...rowSectionStyle }}>
        <View style={{ ...rowSectionInnerStyle }}>{children}</View>
      </View>
    </View>
  );
};

export default RowSection;
