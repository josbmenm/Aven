import React from 'react';
import SendReceiptPage from '../../components/SendReceiptPage';
import { useOrder } from '../../ono-cloud/OnoKitchen';
import useCloud from '../../aven-cloud/useCloud';
import { useNavigation } from '../../navigation-hooks/Hooks';
import useEmptyOrderEscape from '../useEmptyOrderEscape';

export default function SendReceiptScreen(props) {
  const { useParam } = useNavigation();
  const cloud = useCloud();
  const { setOrderName } = useOrder();
  useEmptyOrderEscape();
  return (
    <SendReceiptPage
      {...props}
      type={useParam('type')}
      onSubmit={name => {
        debugger;
      }}
    />
  );
}

SendReceiptScreen.navigationOptions = SendReceiptPage.navigationOptions;
