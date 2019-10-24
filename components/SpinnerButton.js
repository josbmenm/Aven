import Button from './Button';
import Spinner from './Spinner';
import React from 'react';
import { useTheme } from '../dashboard/Theme';

export default function SpinnerButton({
  isLoading,
  children,
  title,
  disabled,
  ...props
}) {
  const { colors } = useTheme();
  return (
    <Button
      {...props}
      title={title}
      titleStyle={{ opacity: isLoading ? 0.2 : 1 }}
      disabled={disabled || isLoading}
    >
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
