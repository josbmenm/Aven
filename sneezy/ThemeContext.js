import React from 'react';

export const theme = {
  colors: {
    primary: '#005151',
    secondary: '',
    white: '#fff',
    lightGrey: '#F8F8F8',
    border: 'rgba(0,0,0,0.1)',
  },
  fonts: {
    Maax: 'Maax',
    MaaxBold: 'Maax-Bold',
    Lora: 'Lora',
  },
  shadows: {
    default: {
      shadowOffset: { width: 0, height: 0 },
      shadowColor: 'black',
      shadowOpacity: 0.08,
      shadowRadius: 22,
    },
    small: {
      shadowOffset: { width: 0, height: 0 },
      shadowColor: 'black',
      shadowOpacity: 0.06,
      shadowRadius: 11,
    },
  },
};

export const ThemeContext = React.createContext(theme);

export function useTheme() {
  const theme = React.useContext(ThemeContext);

  return theme;
}
