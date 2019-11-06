import React, { memo } from 'react';
import { View, Text } from 'react-native';
import {
  sellPriceOfMenuItem,
  displayNameOfMenuItem,
} from '../ono-cloud/OnoKitchen';
import { useOrder } from '../ono-cloud/OrderContext';
import cuid from 'cuid';
import { useNavigation } from '../navigation-hooks/Hooks';
import { MenuCardCarousel } from '../components/MenuCard';
import { MenuZone } from '../components/MenuZone';
import PerformanceDebugging from '../navigation-transitioner/PerformanceDebugging';
import { useRestaurantConfig } from '../logic/RestaurantConfig';

export default function BlendMenu({ menu, large, title }) {
  const restaurantConfig = useRestaurantConfig();
  const hidePrice = !!restaurantConfig && restaurantConfig.mode === 'catering';
  const { navigate } = useNavigation();
  const { order } = useOrder();

  if (!menu.length) {
    return (
      <MenuZone title={'we are out of stock of all blends!'} small={!large} />
    );
  }

  return (
    <MenuZone title={title || 'choose a blend'} small={!large}>
      <MenuCardCarousel
        style={{}}
        large={large}
        hidePrice={hidePrice}
        items={menu.map(item => ({
          key: item.id,
          title: displayNameOfMenuItem(item),
          price: sellPriceOfMenuItem(item),
          benefits: item.Benefits,
          tag: item.DefaultBenefitName,
          photo: item.Recipe && item.Recipe['Recipe Image'],
          onPress: () => {
            const currentOrder = order && order.value.get();
            const currentItems = currentOrder && currentOrder.items;
            const currentItem =
              currentItems &&
              currentItems
                .filter(i => i.menuItemId === item.id)
                .find(i => i.customization == null);

            const orderItemId = (currentItem && currentItem.id) || cuid();
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
