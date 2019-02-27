import React, { memo } from 'react';
import { useOrderItem, useMenuItem, useMenu } from '../../ono-cloud/OnoKitchen';

import useObservable from '../../aven-cloud/useObservable';
import useEmptyOrderEscape from '../useEmptyOrderEscape';
import BlendPage from '../components/BlendPage';

function BlendScreenMemo({ navigation, ...props }) {
  const { getParam } = navigation;
  const orderItemId = getParam('orderItemId');
  const menuItemId = getParam('menuItemId');

  let { order, setItemState, orderItem } = useOrderItem(orderItemId);
  const menuItem = useMenuItem(menuItemId);
  const menu = useMenu();

  const item = useObservable(orderItem && orderItem.observeValue);
  useEmptyOrderEscape();
  return (
    <BlendPage
      menuItem={menuItem}
      item={item || null} // this is to avoid re-rendering when item becomes known as undefined
      foodMenu={menu && menu.food}
      setItemState={setItemState}
      order={order}
      navigation={navigation}
      orderItemId={orderItemId}
      {...props}
    />
  );
}
const BlendScreen = memo(BlendScreenMemo);

BlendScreen.navigationOptions = BlendPage.navigationOptions;

export default BlendScreen;
