import React, { useState, memo } from 'react';

import GenericPage from '../components/GenericPage';
import {
  useMenu,
  sellPriceOfMenuItem,
  displayNameOfMenuItem,
} from '../../ono-cloud/OnoKitchen';
import uuid from 'uuid/v1';

import { useNavigation } from '../../navigation-hooks/Hooks';

import { MenuCardCarousel } from '../components/MenuCard';
import { MenuZone } from '../components/MenuZone';

function BlendsMenu({ menu }) {
  const { navigate } = useNavigation();
  return (
    <MenuZone title="choose a blend">
      <MenuCardCarousel
        style={{}}
        large
        items={menu.map(item => ({
          key: item.id,
          title: displayNameOfMenuItem(item),
          price: sellPriceOfMenuItem(item),
          tag: item.DefaultFunctionName,
          photo: item.Recipe && item.Recipe['Recipe Image'],
          onPress: () => {
            navigate({
              routeName: 'Blend',
              key: `Blend-MenuItem-${item.id}`,
              params: {
                menuItemId: item.id,
                orderItemId: uuid(),
              },
            });
          },
        }))}
      />
    </MenuZone>
  );
}

function FoodMenu({ menu }) {
  const { navigate } = useNavigation();
  return (
    <MenuZone small title="add a snack">
      <MenuCardCarousel
        items={menu.map(item => ({
          key: item.id,
          title: item['Name'],
          price: sellPriceOfMenuItem(item),
          description: displayNameOfMenuItem(item),
          photo: item.Photo,
          onPress: () => {
            navigate('Food', {
              id: item.id,
            });
          },
        }))}
      />
    </MenuZone>
  );
}

function ProductHomeScreenMemo({ ...props }) {
  const menu = useMenu();
  let menuViews = null;
  if (menu) {
    menuViews = (
      <React.Fragment>
        <BlendsMenu menu={menu.blends} />
        <FoodMenu menu={menu.food} />
      </React.Fragment>
    );
  }
  return (
    <GenericPage hideBackButton={true} {...props}>
      {menuViews}
    </GenericPage>
  );
}
const ProductHomeScreen = memo(ProductHomeScreenMemo);

ProductHomeScreen.navigationOptions = GenericPage.navigationOptions;

export default ProductHomeScreen;
