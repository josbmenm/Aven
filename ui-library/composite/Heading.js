import React from 'react';
import { useTheme } from '../Theme';
import Text from '../literals/Text';

export default function Heading({ title, theme: themeProp = {} }) {
  //
  return (
    <Text
      theme={{
        textFontSize: 44,
        textLineHeight: 60,
        textFontWeight: 'bold',
      }}
    >
      {title}
    </Text>
  );
}
