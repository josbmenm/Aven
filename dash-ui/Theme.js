import React from 'react';
import { View } from 'react-native';

const baseTheme = {
  spacing: 8,
  fontSize: 16,
  lineHeight: 24,

  colorTint: '#005252',
  colorForeground: '#333',
  colorBackground: '#f7f7f7',
  colorPrimary: '#005252',
  colorNeutral: '#444',
  colorNegative: '#722',
  colorPositive: '#272',
  colorWarning: '#997200',

  darkMode: false,

  paddingVertical: 8,
  paddingHorizontal: 16,
  fontRegular: 'Maax',
  fontBold: 'Maax-Bold',
  fontProse: 'Lora',
  borderRadius: 3,

  textFont: 'Maax',
  textLineHeight: 24,
  textFontWeight: '400',
  textFontSize: 16,
  headingFont: 'Maax-Bold',
  headingFontSize: 64,
  headingLineHeight: 80,
  headingFontWeight: 'bold',

  inputPaddingTop: 16,
  inputFontSize: 24,

  buttonFontSize: 16,
  buttonLineHeight: 24,
};

export function customizeTheme(customTheme) {
  return {
    ...baseTheme,
    ...customTheme,
  };
}

const ThemeContext = React.createContext();

export function ThemeProvider({ children, theme = baseTheme }) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(theme) {
  // get the base theme from context
  const baseTheme = React.useContext(ThemeContext);

  // get the override values. can be a object or a mapper function
  const overrides = typeof theme === 'function' ? theme(baseTheme) : theme;

  // merge both themes
  return {
    ...baseTheme,
    ...overrides,
  };
}

export function ThemeDebugger({ label }) {
  const theme = useTheme();
  console.log(`ThemeDebugger -> ${label} -> theme`, theme);
  return null;
}

// Context components

export function Large({ children }) {
  // better if we add a fixed values instead of multiplying
  const scaleTheme = useTheme(theme => ({
    fontSize: theme.fontSize + 8,
    buttonFontSize: theme.buttonFontSize + 8,
    textFontSize: theme.textFontSize + 8,
    inputFontSize: theme.inputFontSize + 8,
    headingFontSize: theme.headingFontSize + 8,
    paddingHorizontal: theme.paddingHorizontal + 8,
    paddingVertical: theme.paddingVertical + 8,
  }));

  return (
    <ThemeContext.Provider value={scaleTheme}>{children}</ThemeContext.Provider>
  );
}

export function Color({ values, children }) {
  const colorTheme = useTheme(values);
  return (
    <ThemeContext.Provider value={colorTheme}>{children}</ThemeContext.Provider>
  );
}

const darkTheme = {
  colorTint: '#005252',
  colorBackground: '#333333',
  colorForeground: '#f7f7f7',
  colorPrimary: '#005252',
  colorNeutral: '#524952',
  colorNegative: '#8F3222',
  colorPositive: '#228F41',
  colorWarning: '#B07509',
};

export function DarkMode({ theme = darkTheme, children }) {
  // get the base theme from context
  const baseTheme = React.useContext(ThemeContext);

  // get the override values. can be a object or a mapper function
  const overrides = typeof theme === 'function' ? theme(baseTheme) : theme;
  // merge both themes
  const composedTheme = {
    ...baseTheme,
    ...overrides,
    darkMode: true,
  };

  return (
    <ThemeContext.Provider value={composedTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function Spacing({
  value,
  vertical,
  horizontal,
  top,
  right,
  bottom,
  left,
  children,
  inline = true,
  debug = false,
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        !inline && { flex: 1 },
        value && { margin: value },
        vertical && { marginVertical: vertical },
        horizontal && { marginHorizontal: horizontal },
        top && { marginTop: top },
        right && { marginRight: right },
        bottom && { marginBottom: bottom },
        left && { marginLeft: left },
        debug && { backgroundColor: 'indianred' },
      ]}
    >
      {children}
    </View>
  );
}
