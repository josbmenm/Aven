import React from 'react';
import View from '../views/View';

const FONT_SIZE = 16;
const LINE_HEIGHT = 24;

const FONT_REGULAR = 'Maax';
const FONT_BOLD = 'Maax-Bold';

const COLOR_FOREGROUND = '#333';
const COLOR_BACKGROUND = 'rgba(248,248,248,1.00)';
const COLOR_PRIMARY = 'rgba(0,82,82,0.80)';
const COLOR_WHITE = 'white';

const baseTheme = {
  fontSize: FONT_SIZE,
  lineHeight: LINE_HEIGHT,
  colorForeground: COLOR_FOREGROUND,
  colorBackground: COLOR_BACKGROUND,
  colorPrimary: COLOR_PRIMARY,
  paddingVertical: 8,
  paddingHorizontal: 16,
  fontRegular: FONT_REGULAR,
  fontBold: FONT_BOLD,

  // Text
  textFont: FONT_REGULAR,
  textColor: COLOR_FOREGROUND,
  textLineHeight: LINE_HEIGHT,
  textFontWeight: '400',
  textFontSize: FONT_SIZE,

  // Button
  buttonFgColor: COLOR_WHITE,
  buttonBgColor: COLOR_PRIMARY,
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

export function ScaleUpTheme({ children }) {
  const scaleTheme = useTheme(theme => ({
    fontSize: theme.fontSize * 1.2,
    paddingHorizontal: theme.paddingHorizontal * 2,
    paddingVertical: theme.paddingVertical * 2,
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
}) {
  return (
    <View
      style={[
        { flex: 1 },
        value && { padding: value },
        vertical && { paddingVertical: vertical },
        horizontal && { paddingHorizontal: horizontal },
        top && { paddingTop: top },
        right && { paddingRight: right },
        bottom && { paddingBottom: bottom },
        left && { paddingLeft: left },
      ]}
    >
      {children}
    </View>
  );
}
