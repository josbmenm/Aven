import React from 'react';
import { View } from 'react-native';
import { Text, useTheme, Spacing } from '../dash-ui';

const RowSection = ({ children, title, style }) => {
  const theme = useTheme();
  return (
    <Spacing top={16}>
      {title && (
        <Spacing left={16}>
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
        </Spacing>
      )}
      <View>{children}</View>
    </Spacing>
  );
};

export default RowSection;
