import React from 'react';
import Container from '../dashboard/Container';
import { useTheme } from '../dashboard/Theme'

export default function BlockForm({ children }) {
  const theme = useTheme();
  return (
    <Container style={{ maxWidth: theme.layouts.small }}>
      {children}
    </Container>
  );
}
