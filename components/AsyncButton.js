import React from 'react';
import SpinnerButton from '../components/SpinnerButton';
import useKeyboardPopover from './useKeyboardPopover';

export default function AsyncButton({ onPress, ...props }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { onPopover } = useKeyboardPopover(({ onClose, openArguments }) => (
    <View style={{ minHeight: 100, minWidth: 100, backgroundColor: 'red' }} />
  ));
  function handlePress() {
    setIsLoading(true);
    onPress()
      .then(() => {})
      .catch(err => {
        onPopover(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <SpinnerButton onPress={handlePress} isLoading={isLoading} {...props} />
  );
}
