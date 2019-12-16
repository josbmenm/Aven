import React from 'react';
import { useTheme } from '../Theme';
import Text from '../literals/Text';

export default function Heading({ title, theme: themeProp = {} }) {
  const theme = useTheme(themeProp);
  return (
    <Text
      theme={{
        textFontSize: theme.headingFontSize,
        textLineHeight: theme.headingLineHeight,
        textFontWeight: 'bold',
      }}
    >
      {title}
    </Text>
  );
}
