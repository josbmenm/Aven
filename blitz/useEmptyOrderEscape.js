import { useEffect } from 'react';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useOrder } from '../ono-cloud/OnoKitchen';
import useObservable from '../aven-cloud/useObservable';

process.env.REACT_NAV_LOGGING = true;

export default function useEmptyOrderEscape() {
  const { navigate } = useNavigation();
  const { order } = useOrder();
  const orderValue = order && useObservable(order.observeValue);
  useEffect(
    () => {
      if (orderValue === null) {
        navigate('KioskHome');
      }
    },
    [orderValue],
  );
}
