import React from 'react';
import { useFoodItem, useOrderItem, useMenu } from '../../ono-cloud/OnoKitchen';
import FoodPage from '../../components/FoodPage';
import useObservable from '../../aven-cloud/useObservable';
import { useNavigation } from '../../navigation-hooks/Hooks';

export default function FoodScreen({ ...props }) {
  let { getParam } = useNavigation();
  let foodItemId = getParam('id');
  let orderItemId = `food-${foodItemId}`;
  const menu = useMenu();

  let { order, setItemState, orderItem } = useOrderItem(orderItemId);

  let menuItem = useFoodItem(foodItemId);
  let item = orderItem && useObservable(orderItem.observeValue);

  return (
    <FoodPage
      {...props}
      orderItem={item}
      orderItemId={orderItemId}
      menuItem={menuItem}
      setItemState={setItemState}
      blendsMenu={menu && menu.blends}
    />
  );
}

FoodScreen.navigationOptions = FoodPage.navigationOptions;
