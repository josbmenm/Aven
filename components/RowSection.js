import React from 'react';
import { View } from 'react-native';
import { Text, useTheme, Spacing } from '../dash-ui';

const RowSection = ({ children, title, style }) => {
  const theme = useTheme();
  return (
    <Spacing top={16}>
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
    </Spacing>
  );
};

export default RowSection;
