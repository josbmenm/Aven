import React from 'react';
import Container from '../sneezy/Container';
import { useTheme } from '../sneezy/ThemeContext';

export default function BlockForm({ children }) {
  const theme = useTheme();
  return (
    <Container style={{ maxWidth: theme.layoutWidth.small }}>
      {children}
    </Container>
  );
}
