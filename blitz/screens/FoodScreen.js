import React from 'react';
import { View } from 'react-native';
import ActionPage from '../components/ActionPage';
import { useFoodItem, useOrderItem } from '../../ono-cloud/OnoKitchen';
import { MenuCard } from '../components/MenuCard';
import useObservable from '../../aven-cloud/useObservable';
import { useNavigation } from '../../navigation-hooks/Hooks';

export default function FoodScreen() {
  let { getParam } = useNavigation();
  let foodItemId = getParam('id');
  let orderItemId = `food-${foodItemId}`;

  let { order, setItem, orderItem } = useOrderItem(orderItemId);

  let menuItem = useFoodItem(foodItemId);
  let item = orderItem && useObservable(orderItem.observeValue);

  if (!menuItem || !order) {
    return null;
  }
  let actions = [];
  if (!item || item.quantity < 1) {
    actions.push({
      title: 'add to cart',
      onPress: () => {
        setItem({
          id: orderItemId,
          type: 'food',
          menuItemId: menuItem.id,
          quantity: 1,
        });
      },
    });
  }
  return (
    <ActionPage actions={actions}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ padding: 30, width: 440, marginTop: 120 }}>
          <MenuCard
            key={menuItem.id}
            title={menuItem['Name']}
            tag={menuItem.DefaultFunctionName}
            price={menuItem['Sell Price']}
            photo={menuItem['Photo']}
            onPress={null}
          />
        </View>
      </View>
    </ActionPage>
  );
}
