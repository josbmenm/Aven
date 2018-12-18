import React from 'react';
import InputPage from '../components/InputPage';
import { useOrder } from '../../ono-cloud/OnoKitchen';
import { useNavigation } from '../../navigation-hooks/Hooks';

export default function CollectName() {
  const { navigate } = useNavigation();
  const { setOrderName } = useOrder();
  return (
    <InputPage
      {...this.props}
      title={'Pickup Name'}
      onSubmit={name => {
        setOrderName(name);
        navigate('OrderConfirm');
      }}
    />
  );
}
