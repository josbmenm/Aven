import React from 'react';
import { useOrder } from '../ono-cloud/OrderContext';
import useEmptyOrderEscape from './useEmptyOrderEscape';
import { useNavigation } from '../navigation-hooks/Hooks';
import ReceiptPage from '../components/ReceiptPage';

export default function ReceiptScreen({ ...props }) {
  const { navigate } = useNavigation();
  const { resetOrder } = useOrder();
  useEmptyOrderEscape();
  return (
    <ReceiptPage
      hideBackButton={true}
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
      onComplete={() => {
        resetOrder();
        navigate('KioskHome');
      }}
      {...props}
    />
  );
}
ReceiptScreen.navigationOptions = ReceiptPage.navigationOptions;
