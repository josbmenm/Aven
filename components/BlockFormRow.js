import React from 'react';
import Stack from '../ui-library/layout/Stack';
import { Spacing } from '../ui-library/Theme';

export default function BlockFormRow({ children, inline = false }) {
  return (
    <Stack horizontal inline={inline}>
      {children}
    </Stack>
  );
}
