import Button from '../dash-ui/Button';
import Spinner from './Spinner';
import React from 'react';
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
      {isLoading && (
        <Spinner
          color={theme.colorForeground}
          style={{ alignSelf: 'center', position: 'absolute' }}
        />
      )}
      {children}
    </Button>
  );
}
