import React from 'react';
import SpinnerButton from './SpinnerButton';
import Button from '../ui-library/literals/Button';

export default function BlockFormButton({
  buttonStyle,
  style,
  type,
  isLoading,
  ...props
}) {
  return (
    <SpinnerButton
      {...props}
      type={type || 'solid'}
      size="large"
      style={{
        flex: 1,

        marginVertical: 0,
        ...style,
      }}
      isLoading={isLoading}
      buttonStyle={{
        ...buttonStyle,
      }}
    />
  );
}
