import React from 'react';
import SendReceiptPage from '../components/SendReceiptPage';
import { useNavigation } from '../navigation-hooks/Hooks';
import useCloud from '../cloud-core/useCloud';
import useEmptyOrderEscape from './useEmptyOrderEscape';

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
        handlePromise(
          cloud.dispatch({
            type: 'SendReceipt',
            contact: resp,
          }),
        );
      }}
    />
  );
}

SendReceiptScreen.navigationOptions = SendReceiptPage.navigationOptions;
