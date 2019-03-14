import React, { memo } from 'react';
import {
  sellPriceOfMenuItem,
  displayNameOfMenuItem,
  useOrder,
} from '../ono-cloud/OnoKitchen';
import uuid from 'uuid/v1';
import { useNavigation } from '../navigation-hooks/Hooks';
import { MenuCardCarousel } from '../components/MenuCard';
import { MenuZone } from '../components/MenuZone';
import PerformanceDebugging from '../navigation-transitioner/PerformanceDebugging';

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
          tag: item.DefaultEnhancementName,
          photo: item.Recipe && item.Recipe['Recipe Image'],
          onPress: () => {
            const currentOrder = order && order.getValue();
            const currentItems = currentOrder && currentOrder.items;
            const currentItem =
              currentItems &&
              currentItems
                .filter(i => i.menuItemId === item.id)
                .find(
                  i =>
                    i.customization == null ||
                    i.customization.ingredients == null,
                );

            const orderItemId = (currentItem && currentItem.id) || uuid();
            console.log('navigate', {
              orderItemId,
              menuItemId: item.id,
            });
            PerformanceDebugging.markTransitionStart(
              `blend-item-${orderItemId}`,
            );
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
