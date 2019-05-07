import { useEffect } from 'react';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useOrder } from '../ono-cloud/OnoKitchen';
import useObservable from '../cloud-core/useObservable';
import { StackActions, NavigationActions } from '../navigation-core';

export default function useEmptyOrderEscape() {
  const { dispatch, dangerouslyGetParent } = useNavigation();
  const { order } = useOrder();

  const orderValue = useObservable(order && order.observeValue);
  useEffect(() => {
    if (orderValue === null) {
      dispatch(
        NavigationActions.back({
          key: dangerouslyGetParent().state.key,
        }),
      );
    }
  }, [orderValue]);
}
