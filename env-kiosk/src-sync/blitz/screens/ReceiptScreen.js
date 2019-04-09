import React from 'react';
import { useOrder } from '../../ono-cloud/OnoKitchen';
import useEmptyOrderEscape from '../useEmptyOrderEscape';
import { useNavigation } from '../../navigation-hooks/Hooks';
import ReceiptPage from '../../components/ReceiptPage';

export default function ReceiptScreen({ props }) {
  const { navigate } = useNavigation();
  const { resetOrder } = useOrder();
  useEmptyOrderEscape();
  return (
    <ReceiptPage
      onSms={() => {
        navigate('SendReceipt', { type: 'sms' });
      }}
      onEmail={() => {
        navigate('SendReceipt', { type: 'email' });
      }}
      onNoReceipt={() => {
        resetOrder();
        navigate('OrderComplete');
      }}
      {...props}
    />
  );
}
ReceiptScreen.navigationOptions = ReceiptPage.navigationOptions;
