import React from 'react';
import Heading from '../dash-ui/Heading';
import { Spacing, useTheme } from '../dash-ui/Theme';

export default function BlockFormMessage({ message }) {
  const theme = useTheme();
  return (
    <Heading
      title={message}
      theme={{
        colorForeground: theme.colorPrimary,
        headingFontSize: 26,
        headingLineHeight: 34,
        headingFont: theme.fontProse,
        headingFontWeight: '400',
      }}
    />
  );
}
