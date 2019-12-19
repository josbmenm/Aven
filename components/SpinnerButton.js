import Button from '../dash-ui/Button';
import Spinner from './Spinner';
import React from 'react';
import { useTheme } from '../dashboard/Theme';

export default function SpinnerButton({
  isLoading = false,
  children,
  title,
  disabled,
  ...props
}) {
  const { colors } = useTheme();
  return (
    <Button {...props} title={title} disabled={disabled || isLoading}>
      {isLoading && (
        <Spinner
          color={colors.invertedText}
          style={{ alignSelf: 'center', position: 'absolute' }}
        />
      )}
      {children}
    </Button>
  );
}
