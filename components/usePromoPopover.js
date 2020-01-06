import React from 'react';
import { Text, View } from 'react-native';
import { primaryFontFace, monsterra } from './Styles';
import { useOrder } from '../ono-cloud/OrderContext';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import BlockFormTitle from './BlockFormTitle';
import BlockFormMessage from './BlockFormMessage';
import BlockFormInput from './BlockFormInput';
import { Stack, SpinnerButton, Spacing } from '../dash-ui';
import { useCloud } from '../cloud-core/KiteReact';
import { Easing } from 'react-native-reanimated';
import useFocus from '../navigation-hooks/useFocus';

function BlockFormErrorRow({ error }) {
  return (
    <View style={{ minHeight: 45, padding: 10 }}>
      {error && (
        <Text style={{ color: monsterra, ...primaryFontFace, fontSize: 14 }}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

function PromoCodeForm({ onClose, orderDispatch, cloud }) {
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState('');
  const inputRenderers = [
    inputProps => (
      <BlockFormInput
        label="promo code"
        mode="code"
        onValue={setPromoCode}
        value={promoCode}
        upperCase
        {...inputProps}
      />
    ),
  ];

  function handleSubmit() {
    setError(null);
    setIsLoading(true);
    cloud
      .dispatch({
        type: 'ValidatePromoCode',
        promoCode,
      })
      .then(validPromo => {
        setIsLoading(false);
        if (!validPromo) {
          setError({
            message: 'This promo code is invalid. Please try again.',
          });
          return;
        }
        return orderDispatch({
          type: 'SetPromo',
          promo: validPromo,
        }).then(onClose);
      })
      .catch(e => {
        setIsLoading(false);
        setError(e);
      });
  }
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });
  return (
    <Spacing value={60}>
      <Spacing>
        <BlockFormMessage message="You’ve got a code? Lucky you!" />
        <BlockFormTitle title="whats your promo code?" />
        {inputs}
        <BlockFormErrorRow error={error} />
      </Spacing>
      <Stack horizontal inline>
        <SpinnerButton title="cancel" outline onPress={onClose} />
        <SpinnerButton
          size="large"
          title="add code"
          isLoading={isLoading}
          onPress={handleSubmit}
        />
      </Stack>
    </Spacing>
  );
}

export default function usePromoPopover() {
  const { orderDispatch } = useOrder();
  const cloud = useCloud();

  const { onPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <PromoCodeForm
            onClose={onClose}
            orderDispatch={orderDispatch}
            cloud={cloud}
          />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return onPopover;
}
