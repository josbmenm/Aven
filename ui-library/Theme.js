import React from 'react';

const BASE_FONT_SIZE = 16;

const baseTheme = {
  fontSize: BASE_FONT_SIZE,
  lineHeight: BASE_FONT_SIZE * 1.4,
  colors: {
    foreground: '#333',
    background: 'rgba(248,248,248,1.00)',
    primary: 'rgba(0,82,82,0.80)',
  },
  paddingVertical: 8,
  paddingHorizontal: 16,
  fonts: {
    regular: 'Maax',
    bold: 'Maax-Bold',
    serif: 'Lora',
  },
};

const ThemeContext = React.createContext();

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={baseTheme}>{children}</ThemeContext.Provider>
  );
}

export function ScaleUpTheme({ children }) {
  const theme = useTheme();
  const scaledTheme = {
    ...theme,
    fontSize: theme.fontSize * 1.2,
    paddingHorizontal: theme.paddingHorizontal * 1.5,
    paddingVertical: theme.paddingVertical * 1.5,
  };

  return (
    <ThemeContext.Provider value={scaledTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function Color({ values, children }) {
  const theme = useTheme();
  const colorTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      ...values,
    },
  };

  return (
    <ThemeContext.Provider value={colorTheme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function ThemeDebugger({ label }) {
  const theme = useTheme();
  console.log(`TCL: ThemeDebugger -> ${label} -> theme`, theme);
  return null;
}
