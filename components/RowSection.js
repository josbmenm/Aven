import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from '../dash-ui';
import { rowSectionStyle, boldPrimaryFontFace } from './Styles';

const RowSection = ({ children, title, style }) => {
  const theme = useTheme();
  return (
    <View style={{ ...style }}>
      {title && (
        <Text
          theme={{
            fontFamily: theme.fontBold,
            color: '#282828',
            fontSize: 24,
            lineHeight: 32,
          }}
        >
          {title}
        </Text>
      )}
      <View style={{ ...rowSectionStyle }}>
        <View>{children}</View>
      </View>
    </View>
  );
};

export default RowSection;
