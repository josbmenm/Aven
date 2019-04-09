import React from 'react';
import SendReceiptPage from '../../components/SendReceiptPage';
import { useNavigation } from '../../navigation-hooks/Hooks';
import useEmptyOrderEscape from '../useEmptyOrderEscape';

export default function SendReceiptScreen(props) {
  const { getParam, navigate } = useNavigation();
  useEmptyOrderEscape();
  return (
    <SendReceiptPage
      {...props}
      type={getParam('type')}
      onSubmit={resp => {
        console.log('Ready to send receipt to', resp);
        alert('Coming soon');
        navigate('OrderComplete');
      }}
    />
  );
}

SendReceiptScreen.navigationOptions = SendReceiptPage.navigationOptions;
