import React from 'react';
import { customizeTheme, ThemeProvider } from '../dash-ui/Theme';

export const theme = customizeTheme({
  colorForeground: '#333',
  colorBackground: '#f7f7f7',
  colorPrimary: '#005252',
  colorNeutral: '#444',
  colorNegative: '#722',
  colorPositive: '#272',
  colorWarning: '#997200',

  fontRegular: 'Maax',
  fontBold: 'Maax-Bold',
  fontProse: 'Lora',

  textFont: 'Maax',
  headingFont: 'Maax-Bold',

  buttonFontSize: 20,
  buttonLineHeight: 24,
});

export default function OnoThemeProvider({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
