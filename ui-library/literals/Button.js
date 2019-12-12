import React from 'react';
import Text from './Text';
import View from '../../views/View';
import { useTheme, Color } from '../Theme';

export default function Button({ title }) {
  const theme = useTheme();

  return (
    <Color
      values={{
        foreground: 'white',
        background: theme.colors.primary,
      }}
    >
      <View
        accessibilityRole="button"
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: theme.paddingVertical,
          paddingHorizontal: theme.paddingHorizontal,
          alignItems: 'center',
          borderRadius: 3,
          color: theme.colors.foreground,
        }}
      >
        <Text fontFamily={theme.fonts.bold} fontWeight="bold">
          {title}
        </Text>
      </View>
    </Color>
  );
}
