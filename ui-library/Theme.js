import React from 'react';
import { View } from 'react-native';

const baseTheme = {
  spacing: 8,
  fontSize: 16,
  lineHeight: 24,
  colorForeground: '#333',
  colorBackground: 'rgba(248,248,248,1.00)',
  colorPrimary: 'hsl(180, 100%, 16%)',
  colorNeutral: '#444',
  colorNegative: '#722',
  colorPositive: '#272',
  colorWarning: '#997200',
  paddingVertical: 8,
  paddingHorizontal: 16,
  fontRegular: 'Maax',
  fontBold: 'Maax-Bold',
  fontProse: 'Lora',
  borderRadius: 4,

  textFont: 'Maax',
  textColor: '#333',
  textLineHeight: 24,
  textFontWeight: '400',
  textFontSize: 16,
  headingFont: 'Maax-Bold',
  headingFontSize: 64,
  headingLineHeight: 80,
  headingFontWeight: 'bold',
};

const ThemeContext = React.createContext();

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={baseTheme}>{children}</ThemeContext.Provider>
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

export function Spacing({
  value,
  vertical,
  horizontal,
  top,
  right,
  bottom,
  left,
  children,
  flex = true,
}) {
  return (
    <View
      style={[
        flex && { flex: 1 },
        value && { margin: value },
        vertical && { marginVertical: vertical },
        horizontal && { marginHorizontal: horizontal },
        top && { marginTop: top },
        right && { marginRight: right },
        bottom && { marginBottom: bottom },
        left && { marginLeft: left },
      ]}
    >
      {children}
    </View>
  );
}
