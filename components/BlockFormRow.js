import React from 'react';
import Stack from '../dash-ui/Stack';
import { Spacing } from '../dash-ui/Theme';

export default function BlockFormRow({ children, inline = false }) {
  return (
    <Stack horizontal inline={inline}>
      {children}
    </Stack>
  );
}
