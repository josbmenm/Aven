import React, { Component } from 'react';
import GenericPage from '../components/GenericPage';
import Button from '../../components/Button';
import Title from '../../components/Title';
import { useOrder } from '../../ono-cloud/OnoKitchen';
import useEmptyOrderEscape from '../useEmptyOrderEscape';
import { useNavigation } from '../../navigation-hooks/Hooks';

export default function OrderComplete() {
  const { navigate } = useNavigation();
  const { resetOrder } = useOrder();
  useEmptyOrderEscape();
  return (
    <GenericPage>
      <Title>Order placed!</Title>
      <Button
        title="Free blend - text link to app"
        onPress={() => {
          navigate('AppUpsell');
        }}
      />
      <Button
        title="Email Reciept"
        onPress={() => {
          navigate('CollectEmail');
        }}
      />
      <Button
        title="Done!"
        onPress={() => {
          resetOrder();
          navigate('KioskHome');
        }}
      />
    </GenericPage>
  );
}
