import React from 'react';
import { useCloud } from '../cloud-core/KiteReact';
import useAsyncError from '../react-utils/useAsyncError';
import SpinnerButton from '../components/SpinnerButton';
import { useKitchenState } from '../ono-cloud/OnoKitchen';
import KitchenCommands from '../logic/KitchenCommands';

export default function KitchenCommandButton({ commandType, params, title }) {
  const [isLoading, setIsLoading] = React.useState(false);
  let isDisabled = true;
  const cloud = useCloud();
  const kitchenState = useKitchenState();
  const handleError = useAsyncError();

  if (kitchenState) {
    const command = KitchenCommands[commandType];
    const isReady = command.checkReady(kitchenState);
    if (isReady) isDisabled = false;
  }

  function handlePress() {
    setIsLoading(true);
    handleError(
      cloud
        .dispatch({
          type: 'KitchenCommand',
          commandType,
          params,
        })
        .finally(() => {
          setIsLoading(false);
        }),
    );
  }

  return (
    <SpinnerButton
      onPress={handlePress}
      isLoading={isLoading}
      disabled={isDisabled}
      title={title}
    />
  );
}
