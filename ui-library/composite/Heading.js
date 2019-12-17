import React from 'react';
import { useTheme } from '../Theme';
import Text from '../literals/Text';

export default function Heading({ title, theme: themeProp = {} }) {
  const theme = useTheme(themeProp);
  return (
    <Text
      theme={{
        textColor: theme.colorPrimary,
        textFontSize: theme.headingFontSize,
        textLineHeight: theme.headingLineHeight,
        textFontWeight: theme.headingFontWeight,
        textFont: theme.headingFont,
      }}
    >
      {title}
    </Text>
  );
}
