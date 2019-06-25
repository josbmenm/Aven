import { createContext, useContext, useMemo } from 'react';

const fontSizes = [10, 12, 16, 18, 20, 32, 44];

const primaryColor = '#3d70b2';
const secondaryColor = '#5596e6';

const colors = {
  primary: primaryColor,
  primary5: `${primaryColor}0D`,
  primary8: `${primaryColor}14`,
  primary10: `${primaryColor}20`,
  primary30: `${primaryColor}4C`,
  primary40: `${primaryColor}66`,
  primary50: `${primaryColor}80`,
  primary60: `${primaryColor}99`,
  primary70: `${primaryColor}B2`,
  primary80: `${primaryColor}CC`,
  secondary: secondaryColor,
  secondary5: `${secondaryColor}0D`,
  secondary8: `${secondaryColor}14`,
  secondary10: `${secondaryColor}20`,
  secondary30: `${secondaryColor}4C`,
  secondary40: `${secondaryColor}66`,
  secondary50: `${secondaryColor}80`,
  secondary60: `${secondaryColor}99`,
  secondary70: `${secondaryColor}B2`,
  secondary80: `${secondaryColor}CC`,
  white: '#fff',
  lightGrey: '#F8F8F8',
  lighterGrey: '#EFEFEF',
  border: 'rgba(0,0,0,0.1)',
};

const fontFamily = {
  body: 'system-ui, sans-serif',
  heading: 'Georgia, serif',
  monospace: 'Menlo, monospace',
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
    fontSizes,
    lineHeight: 48,
    fontFamily: fontFamily.heading,
  },
  body: {
    ...textDefaults,
    ...textSpacing,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fontFamily.body,
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
  breakpoints: [768],
  colors,
  fontFamily,
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
