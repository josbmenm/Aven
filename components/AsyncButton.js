import React from 'react';
import useAsyncError from '../react-utils/useAsyncError';
import SpinnerButton from '../components/SpinnerButton';

export default function AsyncButton({ onPress, ...props }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const handleError = useAsyncError();

  function handlePress() {
    setIsLoading(true);
    handleError(
      onPress().finally(() => {
        setIsLoading(false);
      }),
    );
  }

  return (
    <SpinnerButton onPress={handlePress} isLoading={isLoading} {...props} />
  );
}
