import React from 'react';
import { useOrder } from '../../ono-cloud/OnoKitchen';
import useEmptyOrderEscape from '../useEmptyOrderEscape';
import { useNavigation } from '../../navigation-hooks/Hooks';
import OrderCompletePage from '../components/OrderCompletePage';

export default function OrderCompleteScreen({ props }) {
  const { navigate } = useNavigation();
  const { resetOrder } = useOrder();
  useEmptyOrderEscape();
  return (
    <OrderCompletePage
      onSms={() => {
        navigate('SendReciept', { type: 'sms' });
      }}
      onEmail={() => {
        navigate('SendReciept', { type: 'email' });
      }}
      onNoReceipt={() => {
        resetOrder();
        navigate('AppUpsell');
      }}
      {...props}
    />
  );
}

OrderCompleteScreen.navigationOptions = OrderCompletePage.navigationOptions;
