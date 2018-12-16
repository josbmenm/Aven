import { useEffect } from 'react';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useOrderSummary } from '../ono-cloud/OnoKitchen';

export default function useEmptyOrderEscape() {
  const { navigate } = useNavigation();
  const orderSummary = useOrderSummary();

  useEffect(
    () => {
      if (orderSummary === null) {
        navigate('KioskHome');
      }
    },
    [orderSummary],
  );
}
