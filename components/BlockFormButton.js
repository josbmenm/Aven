import React from 'react';
import SpinnerButton from '../dash-ui/SpinnerButton';

export default function BlockFormButton({ style, type, isLoading, ...props }) {
  return (
    <SpinnerButton {...props} type={type || 'solid'} isLoading={isLoading} />
  );
}
