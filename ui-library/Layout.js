import React from 'react';
import View from '../views/View';
import { ThemeProvider } from './Theme';

export function Layout({ children, ...rest }) {
  return (
    <ThemeProvider>
      <View style={{ padding: 40 }}>{children}</View>
    </ThemeProvider>
  );
}

export function Container({ children }) {
  return <View style={{ marginVertical: 40 }}>{children}</View>;
}
