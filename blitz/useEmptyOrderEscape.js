import { useEffect } from 'react';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useOrder } from '../ono-cloud/OnoKitchen';
import useObservable from '../aven-cloud/useObservable';
import { StackActions, NavigationActions } from '../navigation-core';

process.env.REACT_NAV_LOGGING = true;

export default function useEmptyOrderEscape() {
  const { dispatch, dangerouslyGetParent } = useNavigation();
  const { order } = useOrder();
  const orderValue = useObservable(order && order.observeValue);
  useEffect(
    () => {
      if (orderValue === null) {
        dispatch(
          NavigationActions.back({
            key: dangerouslyGetParent().state.key,
          }),
        );
      }
    },
    [orderValue],
  );
}
