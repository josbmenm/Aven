import React from 'react';
import { useTheme } from './Theme';
import Text from './Text';

export default function Heading({ title, theme: themeProp = {} }) {
  const theme = useTheme(themeProp);
  return (
    <Text
      theme={{
        colorForeground: theme.colorPrimary,
        fontSize: theme.headingFontSize,
        lineHeight: theme.headingLineHeight,
        fontWeight: theme.headingFontWeight,
        textFont: theme.headingFont,
      }}
    >
      {title}
    </Text>
  );
}
