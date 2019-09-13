import React, { memo } from 'react';
import { useInventoryMenuItem, useMenu } from '../ono-cloud/OnoKitchen';
import { useOrderItem } from '../ono-cloud/OrderContext';

import useEmptyOrderEscape from './useEmptyOrderEscape';
import BlendPage from '../components/BlendPage';

function BlendScreenMemo({ navigation, ...props }) {
  const { getParam } = navigation;
  const orderItemId = getParam('orderItemId');
  const menuItemId = getParam('menuItemId');

  let { order, setItemState, orderItem } = useOrderItem(orderItemId);
  const { menuItem } = useInventoryMenuItem(menuItemId);
  const menu = useMenu();

  useEmptyOrderEscape();
  return (
    <BlendPage
      menuItem={menuItem}
      item={orderItem || null} // this is to avoid re-rendering when item becomes known as undefined
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
