import React, { useState, useMemo, useEffect } from 'react';
import { useOrderItem, useMenuItem } from '../../ono-cloud/OnoKitchen';
import useObservable from '../../cloud-core/useObservable';
import CustomizePage from '../../components/CustomizePage';

export default function CustomizeBlendScreen({ navigation, ...props }) {
  const { getParam } = navigation;
  const orderItemId = getParam('orderItemId');
  const menuItemId = getParam('menuItemId');

  let { orderItem, setItemState } = useOrderItem(orderItemId);
  const menuItem = useMenuItem(menuItemId);
  const item = useObservable(orderItem && orderItem.observeValue);
  const initialCustomization = useMemo(() => {
    return item && item.customization;
  }, [item]);
  let [customizationState, setCustomization] = useState(null);
  useEffect(() => {
    // this is lame but the initial customization arrives asyncronously
    if (initialCustomization && !customizationState) {
      setCustomization(initialCustomization);
    }
  }, [customizationState, initialCustomization]);

  return (
    <CustomizePage
      setCustomization={setCustomization}
      customizationState={customizationState}
      menuItem={menuItem}
      cartItem={item}
      setCartItem={setItemState}
      orderItemId={orderItemId}
      navigation={navigation}
      {...props}
    />
  );
}

CustomizeBlendScreen.navigationOptions = CustomizePage.navigationOptions;
