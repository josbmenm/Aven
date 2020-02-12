import { createContext, useContext, useMemo } from 'react';

const primaryColor = '#3d70b2';
const secondaryColor = '#5596e6';

const colors = {
  primary: primaryColor,
  primaryBg: primaryColor,
  secondary: secondaryColor,
  secondaryBg: secondaryColor,
  white: '#fff',
  lightGrey: '#F8F8F8',
  lighterGrey: '#EFEFEF',
  border: 'rgba(0,0,0,0.1)',
  text: primaryColor,
};

const fonts = {
  regular: 'Maax',
  bold: 'Maax-Bold',
  serif: 'Lora',
};

const headingStyles = {
  small: {
    fontSize: [24, 28],
    lineHeight: [32, 48],
    letterSpacing: ['auto', 0.44],
  },
  medium: {
    fontSize: [24, 36],
    lineHeight: [32, 44],
  },
  large: {
    fontSize: [24, 38],
    lineHeight: [32, 48],
    letterSpacing: ['auto', 0.5],
  },
};

const textStyles = {
  small: {
    fontSize: [10, 10],
    lineHeight: [12, 12],
  },
  medium: {
    fontSize: [13, 13],
    lineHeight: [20, 20],
  },
  large: {
    fontSize: [15, 18],
    lineHeight: [24, 28],
    letterSpacing: [0.25, 0.3],
  },
};

const shadows = {
  large: {
    shadowOffset: { width: 0, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  medium: {
    shadowOffset: { width: 0, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  small: {
    shadowOffset: { width: 0, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
};

export const theme = {
  space: [0, 4, 8, 12, 16, 20, 24, 28, 32],
  radii: [0, 2, 4, 8],
  fontSizes: [12, 18, 20, 28, 38],
  breakpoints: [768, 1024],
  colors,
  fonts,
  headingStyles,
  textStyles,
  shadows,
  layouts: {
    small: 640,
    large: 1280,
  },
};

export const ThemeContext = createContext(theme);
export const ThemeProvider = ThemeContext.Provider;

export function useTheme() {
  const theme = useContext(ThemeContext);
  return useMemo(() => theme, [theme]);
}
