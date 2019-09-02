import React from 'react';
import SendReceiptPage from '../components/SendReceiptPage';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useCloud } from '../cloud-core/KiteReact';
import useEmptyOrderEscape from './useEmptyOrderEscape';
import { useOrder } from '../ono-cloud/OrderContext';
import { getLocalName } from '../ono-cloud/OnoKitchen';

function usePromiseState(onResult) {
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState();
  const [isProgressing, setIsProgressing] = React.useState(false);
  function handlePromise(promise) {
    setResult(undefined);
    setError(null);
    setIsProgressing(true);
    promise
      .then(r => {
        onResult(r);
        setResult(r);
        setError(null);
        setIsProgressing(false);
      })
      .catch(err => {
        setResult(undefined);
        setError(err);
        setIsProgressing(false);
      });
  }
  return { isProgressing, error, result, handlePromise };
}

export default function SendReceiptScreen(props) {
  const cloud = useCloud();
  const { getParam, navigate } = useNavigation();
  const { order } = useOrder();
  const { error, isProgressing, handlePromise } = usePromiseState(resp => {
    navigate('OrderComplete');
  });
  useEmptyOrderEscape();
  return (
    <SendReceiptPage
      {...props}
      type={getParam('type')}
      error={error}
      isProgressing={isProgressing}
      onSubmit={resp => {
        if (!order) {
          alert('Whoops! Ask your guide to send your receipt.');
          return;
        }
        handlePromise(
          cloud.dispatch({
            type: 'SendReceipt',
            contact: resp,
            orderId: getLocalName(order.getName()),
          }),
        );
      }}
    />
  );
}

SendReceiptScreen.navigationOptions = SendReceiptPage.navigationOptions;
