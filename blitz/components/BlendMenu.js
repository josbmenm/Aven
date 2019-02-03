import React from 'react';
import {
  sellPriceOfMenuItem,
  displayNameOfMenuItem,
  useOrder,
} from '../../ono-cloud/OnoKitchen';
import uuid from 'uuid/v1';
import { useNavigation } from '../../navigation-hooks/Hooks';
import { MenuCardCarousel } from '../components/MenuCard';
import { MenuZone } from '../components/MenuZone';

export default function BlendMenu({ menu, large, title }) {
  const { navigate } = useNavigation();
  const { order } = useOrder();
  return (
    <MenuZone title={title || 'choose a blend'} small={!large}>
      <MenuCardCarousel
        style={{}}
        large={large}
        items={menu.map(item => ({
          key: item.id,
          title: displayNameOfMenuItem(item),
          price: sellPriceOfMenuItem(item),
          tag: item.DefaultFunctionName,
          photo: item.Recipe && item.Recipe['Recipe Image'],
          onPress: () => {
            const currentOrder = order && order.getValue();
            const currentItems = currentOrder && currentOrder.items;
            const currentItem =
              currentItems &&
              currentItems.find(i => {
                return i.customization == null && i.menuItemId === item.id;
              });
            const orderItemId = (currentItem && currentItem.id) || uuid();
            console.log('navigate', {
              orderItemId,
              menuItemId: item.id,
            });
            navigate({
              routeName: 'Blend',
              params: {
                orderItemId,
                menuItemId: item.id,
              },
              key: `blend-item-${orderItemId}`,
            });
          },
        }))}
      />
    </MenuZone>
  );
}
