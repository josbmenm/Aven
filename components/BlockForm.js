import React from 'react';
import Container from '../sneezy/Container';
import { useTheme } from '../dashboard/Theme'

export default function BlockForm({ children }) {
  const theme = useTheme();
  return (
    <Container style={{ maxWidth: theme.layoutWidth.small }}>
      {children}
    </Container>
  );
}
