import React from 'react';
import Container from '../dashboard-ui-deprecated/Container';
import { useTheme } from '../dashboard-ui-deprecated/Theme';

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
