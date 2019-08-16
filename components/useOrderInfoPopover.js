import React from 'react';
import { View } from 'react-native';
import Button from './Button';
import { Easing } from 'react-native-reanimated';
import BlockFormInput from './BlockFormInput';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import useFocus from '../navigation-hooks/useFocus';

function SetInfoForm({ onClose, initialInfo, onSubmit, hideBlendName }) {
  const [orderName, setOrderName] = React.useState(initialInfo.orderName);
  const [blendName, setBlendName] = React.useState(initialInfo.blendName);

  function handleSubmit() {
    onSubmit({ orderName, blendName });
    onClose();
  }

  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      inputProps => (
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <BlockFormInput
            {...inputProps}
            label="Order Name"
            onValue={setOrderName}
            value={orderName}
          />
        </View>
      ),
      hideBlendName
        ? null
        : inputProps => (
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
              <BlockFormInput
                {...inputProps}
                label="Blend Name"
                onValue={setBlendName}
                value={blendName}
              />
            </View>
          ),
    ],
  });

  return (
    <React.Fragment>
      {inputs}
      <Button onPress={handleSubmit} title="save" />
    </React.Fragment>
  );
}

export default function useOrderInfoPopover({
  orderName,
  blendName,
  onOrderInfo,
  hideBlendName,
}) {
  const { onPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <SetInfoForm
            initialInfo={{ orderName, blendName }}
            onClose={onClose}
            hideBlendName={hideBlendName}
            onSubmit={onOrderInfo}
          />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return onPopover;
}
