import React from 'react';
import {
  sellPriceOfMenuItem,
  displayNameOfMenuItem,
} from '../ono-cloud/OnoKitchen';
import { useNavigation } from '../navigation-hooks/Hooks';
import { MenuCardCarousel } from '../components/MenuCard';
import { MenuZone } from '../components/MenuZone';

export default function FoodMenu({ foodMenu }) {
  return null; // no food until july
  const { navigate } = useNavigation();
  return (
    <MenuZone small title="add a snack">
      <MenuCardCarousel
        items={foodMenu.map(item => ({
          key: item.id,
          title: item['Name'],
          price: sellPriceOfMenuItem(item),
          description: displayNameOfMenuItem(item),
          photo: item.Photo,
          onPress: () => {
            navigate({
              routeName: 'Food',
              params: {
                id: item.id,
              },
              key: `food-item-${item.id}`,
            });
          },
        }))}
      />
    </MenuZone>
  );
}
