import React, { Component, useEffect } from 'react';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';
import Button from '../../components/Button';
import { Text, View } from 'react-native';
import {
  withMenu,
  useOrder,
  useOrderSummary,
} from '../../ono-cloud/OnoKitchen';
import useObservable from '../../aven-cloud/useObservable';
import { paymentContainer } from '../Payments';
import { useNavigation } from '../../navigation-hooks/Hooks';
import useEmptyOrderEscape from '../useEmptyOrderEscape';
import Reciept from '../../components/Reciept';
import { useCardReader } from '../CardReader';

export default function OrderConfirmScreen({
  paymentRequest,
  paymentError,
  isPaymentReady,
  isPaymentComplete,
  paymentActivityLog,
  navigation,
}) {
  const { confirmOrder } = useOrder();
  const summary = useOrderSummary();
  const { cancelPayment, getPayment, readerIsReady } = useCardReader();
  const currentlyReady = useObservable(readerIsReady);
  useEffect(
    () => {
      if (currentlyReady) {
        getPayment(summary.total, 'Ono Blends')
          .then(() => {
            console.log('payment done!!!!');
          })
          .catch(e => {
            console.error(e);
          });
      }
    },
    [currentlyReady, summary],
  );
  return (
    <GenericPage>
      <Reciept summary={summary} />
      <Button
        secondary
        title="cancel"
        onPress={async () => {
          await cancelPayment();
        }}
      />
      <Button
        title="skip payment (TEST ONLY)"
        onPress={async () => {
          await confirmOrder();
          navigation.navigate('OrderComplete');
        }}
      />
    </GenericPage>
  );
}
