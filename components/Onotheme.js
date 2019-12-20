import React from 'react';
import { customizeTheme, ThemeProvider, DarkMode } from '../dash-ui/Theme';

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

export function DarkModeProvider({ children }) {
  return (
    <DarkMode
      theme={{
        colorTint: '#005252',
        colorBackground: '#333333',
        colorForeground: '#f7f7f7',
        colorPrimary: '#005252',
        colorNeutral: '#524952',
        colorNegative: '#8F3222',
        colorPositive: '#228F41',
        colorWarning: '#B07509',
      }}
    >
      {children}
    </DarkMode>
  );
}
