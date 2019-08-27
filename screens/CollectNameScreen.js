import React from 'react';
import CollectNamePage from '../components/CollectNamePage';
import { useOrder } from '../ono-cloud/OrderContext';
import { useNavigation } from '../navigation-hooks/Hooks';
import useEmptyOrderEscape from './useEmptyOrderEscape';

export default function CollectNameScreen(props) {
  const { navigate } = useNavigation();
  const { setOrderName, order } = useOrder();
  useEmptyOrderEscape();
  return (
    <CollectNamePage
      {...props}
      onChangeName={setOrderName}
      initialName={(order && order.value.get().orderName) || {}}
      onSubmit={name => {
        navigate('OrderConfirm');
      }}
    />
  );
}

CollectNameScreen.navigationOptions = CollectNamePage.navigationOptions;
