import React from 'react';
import { useFoodItem, useMenu } from '../ono-cloud/OnoKitchen';
import { useOrderItem } from '../ono-cloud/OrderContext';
import FoodPage from '../components/FoodPage';
// import { useStream } from '../cloud-core/KiteReact';
import { useNavigation } from '../navigation-hooks/Hooks';

export default function FoodScreen({ ...props }) {
  let { getParam } = useNavigation();
  let foodItemId = getParam('id');
  let orderItemId = `food-${foodItemId}`;
  const menu = useMenu();

  let { orderDispatch, orderItem } = useOrderItem(orderItemId);

  let menuItem = useFoodItem(foodItemId);

  return (
    <FoodPage
      {...props}
      orderItem={orderItem}
      orderItemId={orderItemId}
      orderDispatch={orderDispatch}
      menuItem={menuItem}
      blendsMenu={menu && menu.blends}
    />
  );
}

FoodScreen.navigationOptions = FoodPage.navigationOptions;
