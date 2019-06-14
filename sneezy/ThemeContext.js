import React from 'react';

const FontSizes = [];

const colors = {
  primary: '#005151',
  secondary: '',
  white: '#fff',
  lightGrey: '#F8F8F8',
  border: 'rgba(0,0,0,0.1)',
};

const fonts = {
  heading: 'Maax-Bold',
  title: 'Maax-Bold',
  body: 'Lora',
  footnote: 'Maax',
  button: 'Maax-Bold'
};

const textSpacing = {
  marginBottom: 8,
};

const textDefaults = {
  color: colors.primary,
};

const textStyles = {
  heading: {
    ...textDefaults,
    ...textSpacing,
    fontSize: 38,
    lineHeight: 48,
    fontFamily: fonts.heading,
  },
  title: {
    ...textDefaults,
    ...textSpacing,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: fonts.title,
  },
  body: {
    ...textDefaults,
    ...textSpacing,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fonts.body,
  },
  footnote: {
    ...textDefaults,
    ...textSpacing,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.footnote,
  },
};

const shadows = {
  default: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'black',
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  small: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'black',
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
};

export const theme = {
  colors,
  fonts,
  textStyles,
  shadows,
};

export const ThemeContext = React.createContext(theme);

export function useTheme() {
  return React.useContext(ThemeContext);
}
