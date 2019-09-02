import { useEffect, useRef } from 'react';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useOrder } from '../ono-cloud/OrderContext';
import useObservable from '../cloud-core/useObservable';
import { StackActions, NavigationActions } from '../navigation-core';

export default function useEmptyOrderEscape() {
  const { dispatch, dangerouslyGetParent } = useNavigation();
  const { order } = useOrder();
  const hasHadOrder = useRef(false);
  const orderValue = useObservable(order && order.observeValue);
  useEffect(() => {
    const parentNavState = dangerouslyGetParent();
    if (orderValue === null && !hasHadOrder.current) {
      parentNavState &&
        dispatch(
          NavigationActions.back({
            key: parentNavState.state.key,
          }),
        );
    } else if (!hasHadOrder.current) {
      hasHadOrder.current = true;
    }
  }, [orderValue]);
}
