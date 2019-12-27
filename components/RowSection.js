import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from '../dash-ui';

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
      <View>{children}</View>
    </View>
  );
};

export default RowSection;
