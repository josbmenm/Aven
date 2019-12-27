import React from 'react';
import SpinnerButton from '../components/SpinnerButton';
import useAsyncErrorPopover from '../components/useAsyncErrorPopover';

export default function AsyncButton({
  onPress,
  title = 'ASYNC DEFAULT',
  disabled = false,
  ...props
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleErrors = useAsyncErrorPopover();
  function handlePress() {
    setIsLoading(true);
    handleErrors(
      onPress()
        .then(() => {})
        .finally(() => {
          setIsLoading(false);
        }),
    );
  }

  return (
    <SpinnerButton
      onPress={handlePress}
      isLoading={isLoading}
      title={title}
      disabled={disabled}
      {...props}
    />
  );
}
