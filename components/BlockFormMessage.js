import React from 'react';
import Heading from '../ui-library/composite/Heading';
import { Spacing, useTheme } from '../ui-library/Theme';

export default function BlockFormMessage({ message }) {
  const theme = useTheme();
  return (
    <Heading
      title={message}
      theme={{
        textColor: theme.colorPrimary,
        headingFontSize: 26,
        headingLineHeight: 34,
        headingFont: theme.fontProse,
        headingFontWeight: '400',
      }}
    />
  );
}
