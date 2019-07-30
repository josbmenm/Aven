import React from 'react';
import { View } from 'react-native';
import Button from './Button';
import { Easing } from 'react-native-reanimated';
import BlockFormInput from './BlockFormInput';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import useFocus from '../navigation-hooks/useFocus';

function SetInfoForm({ onClose, initialInfo, onSubmit, enableBlendName }) {
  const [orderName, setOrderName] = React.useState(initialInfo.orderName);
  const [orderBlendName, setOrderBlendName] = React.useState(
    initialInfo.orderBlendName,
  );

  function handleSubmit() {
    onSubmit({ orderName, orderBlendName });
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
      enableBlendName
        ? inputProps => (
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
              <BlockFormInput
                {...inputProps}
                label="Blend Name"
                onValue={setOrderBlendName}
                value={orderBlendName}
              />
            </View>
          )
        : null,
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
  setOrderName,
  setOrderBlendName,
  orderName,
  orderBlendName,
}) {
  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <SetInfoForm
            initialInfo={{ orderName, orderBlendName }}
            onClose={onClose}
            enableBlendName={!!setOrderBlendName}
            onSubmit={i => {
              setOrderName(i.orderName);
              setOrderBlendName && setOrderBlendName(i.orderBlendName);
            }}
          />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return onPopover;
}
