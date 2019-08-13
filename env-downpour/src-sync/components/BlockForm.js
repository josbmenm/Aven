import React from 'react';
import Container from '../dashboard/Container';
import { useTheme } from '../dashboard/Theme';

export default function BlockForm({ style, responsiveStyles, children }) {
  const theme = useTheme();
  return (
    <Container
      style={{ maxWidth: theme.layouts.small, ...style }}
      responsiveStyles={responsiveStyles}
    >
      {children}
    </Container>
  );
}
