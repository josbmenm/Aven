import React from 'react';
import { customizeTheme, ThemeProvider, DarkMode } from '../dash-ui/Theme';

export const colorNegative = '#722';
export const colorNeutral = '#444';
export const colorPositive = '#272';
export const colorWarning = '#997200';

export const theme = customizeTheme({
  colorForeground: '#333',
  colorBackground: '#f7f7f7',
  colorPrimary: '#005252',
  colorNeutral,
  colorNegative,
  colorPositive,
  colorWarning,

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
