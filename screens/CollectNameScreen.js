import React from 'react';
import CollectNamePage from '../components/CollectNamePage';
import { useOrder } from '../ono-cloud/OrderContext';
import { useNavigation } from '../navigation-hooks/Hooks';
import useEmptyOrderEscape from './useEmptyOrderEscape';
import { error } from '../logger/logger';
import { useRestaurantConfig } from '../logic/RestaurantConfig';
import { Alert } from 'react-native';

export default function CollectNameScreen(props) {
  const { navigate, goBack } = useNavigation();
  const { setOrderName, order, confirmOrder } = useOrder();
  const restaurantConfig = useRestaurantConfig();

  const isCateringMode =
    restaurantConfig && restaurantConfig.mode === 'catering';
  useEmptyOrderEscape();

  async function handleSkippedPayment() {
    await confirmOrder();
  }
  let skipOnceRef = React.useRef(false);
  async function handleOnceSkippedPayment() {
    if (skipOnceRef.current) return;
    skipOnceRef.current = true;
    try {
      await handleSkippedPayment();
    } catch (e) {
      skipOnceRef.current = false;
      throw e;
    }
  }

  return (
    <CollectNamePage
      {...props}
      onChangeName={setOrderName}
      isCateringMode={isCateringMode}
      initialName={(order && order.value.get().orderName) || {}}
      onSubmit={name => {
        if (isCateringMode) {
          navigate('OrderComplete');

          handleOnceSkippedPayment()
            .then(() => {
              console.log('omgz');
            })
            .catch(err => {
              error('PlaceOrderFailure', {
                code: err.message,
              });
              goBack(null);
              Alert.alert(
                'Order failure',
                'Something went wrong. Please try ordering again.',
              );
            });
        } else {
          navigate('OrderConfirm');
        }
      }}
    />
  );
}

CollectNameScreen.navigationOptions = CollectNamePage.navigationOptions;
