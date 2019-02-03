import React from 'react';
import ActionPage from '../components/ActionPage';
import {
  addMenuItemToCartItem,
  displayNameOfOrderItem,
} from '../../ono-cloud/OnoKitchen';
import { MenuCard } from '../components/MenuCard';
import DetailsSection from './DetailsSection';
import MainTitle from './MainTitle';
import DescriptionText from './DescriptionText';
import DetailText from './DetailText';
import { MenuZone, MenuHLayout } from '../components/MenuZone';
import AirtableImage from './AirtableImage';
import { proseFontFace, monsterra } from '../../components/Styles';
import SmallTitle from './SmallTitle';
import BlendMenu from './BlendMenu';
import { View, Text } from 'react-native';

function FoodDetails({ orderItem, menuItem }) {
  return (
    <DetailsSection>
      <MainTitle>{displayNameOfOrderItem(orderItem, menuItem)}</MainTitle>
      <DescriptionText>{menuItem['Display Description']}</DescriptionText>

      <DetailText>{menuItem['Nutrition Info']}</DetailText>
      <SmallTitle>brought to you by:</SmallTitle>
      <View style={{ flexDirection: 'row' }}>
        <AirtableImage
          image={menuItem['Brand Photo']}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />
        <Text style={{ ...proseFontFace, color: monsterra, fontSize: 16 }}>
          {menuItem['Brand Description']}
        </Text>
      </View>
    </DetailsSection>
  );
}

export default function FoodPage({
  orderItem,
  orderItemId,
  menuItem,
  setItemState,
  blendsMenu,
  ...props
}) {
  let actions = [
    {
      title: 'add to cart',
      onPress: () => {
        setItemState(
          addMenuItemToCartItem({
            menuItem,
            orderItemId,
            item: orderItem && orderItem.state,
            itemType: 'food',
          }),
        );
      },
    },
  ];
  return (
    <ActionPage actions={actions} {...props}>
      <MenuZone>
        <MenuHLayout
          side={
            menuItem && (
              <MenuCard
                key={menuItem.id}
                title={menuItem['Name']}
                tag={menuItem.DefaultFunctionName}
                price={menuItem['Sell Price']}
                photo={menuItem['Photo']}
                onPress={null}
                style={{ marginBottom: 116 }}
              />
            )
          }
        >
          {menuItem && (
            <FoodDetails orderItem={orderItem} menuItem={menuItem} />
          )}
        </MenuHLayout>
      </MenuZone>
      {blendsMenu && <BlendMenu menu={blendsMenu} title="add a blend" />}
    </ActionPage>
  );
}

FoodPage.navigationOptions = ActionPage.navigationOptions;
