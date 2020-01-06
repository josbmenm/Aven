import React from 'react';
import { ThemeProvider, DarkMode, baseTheme } from '../dash-ui/Theme';

export const colorNegative = '#722';
export const colorNeutral = '#444';
export const colorPositive = '#272';
export const colorWarning = '#997200';

export const theme = {
  ...baseTheme,
  colorForeground: '#333',
  colorBackground: '#f7f7f7',
  colorPrimary: '#005252',
  colorNeutral,
  colorNegative,
  colorPositive,
  colorWarning,

  borderWidth: 3,
  fontRegular: 'Maax',
  fontBold: 'Maax-Bold',
  fontProse: 'Lora',
  paddingVertical: 8,
  paddingHorizontal: 16,

  textFont: 'Maax',
  headingFont: 'Maax-Bold',

  buttonFontSize: 20,
  buttonLineHeight: 24,
};

export default function OnoThemeProvider({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export function DarkModeProvider({ children }) {
  return (
    <DarkMode
      theme={{
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
