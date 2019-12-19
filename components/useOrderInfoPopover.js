import React from 'react';
import { View } from 'react-native';
import Button from '../dash-ui/Button';
import { Easing } from 'react-native-reanimated';
import BlockFormInput from './BlockFormInput';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import useFocus from '../navigation-hooks/useFocus';
import { Spacing } from '../dash-ui/Theme';

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
        <View>
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
            <Spacing top={8}>
              <BlockFormInput
                {...inputProps}
                label="Blend Name"
                onValue={setBlendName}
                value={blendName}
              />
            </Spacing>
          ),
    ],
  });

  return (
    <React.Fragment>
      {inputs}
      <Spacing top={8}>
        <Button onPress={handleSubmit} title="save" />
      </Spacing>
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
