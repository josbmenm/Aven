import React from 'react';
import Button from './Button';
import Spinner from './Spinner';
import { useTheme } from '../dashboard/Theme';

export default function SpinnerButton({
  onPress,
  isLoading = false,
  children,
  title,
  disabled,
  theme: themeProp,
  ...props
}) {
  const theme = useTheme(themeProp);
  return (
    <Button
      onPress={onPress}
      title={title}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner color={theme.colorBackground} /> : null}
    </Button>
  );
}