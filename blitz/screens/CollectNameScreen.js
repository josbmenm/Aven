import React from 'react';
import CollectNamePage from '../components/CollectNamePage';
import { useOrder } from '../../ono-cloud/OnoKitchen';
import { useNavigation } from '../../navigation-hooks/Hooks';
import useEmptyOrderEscape from '../useEmptyOrderEscape';

export default function CollectNameScreen(props) {
  const { navigate } = useNavigation();
  const { setOrderName } = useOrder();
  useEmptyOrderEscape();
  return (
    <CollectNamePage
      {...props}
      onSubmit={name => {
        setOrderName(name);
        navigate('OrderConfirm');
      }}
    />
  );
}

CollectNameScreen.navigationOptions = CollectNamePage.navigationOptions;
