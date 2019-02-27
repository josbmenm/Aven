import React from 'react';
import { View, Text } from 'react-native';
import ActionPage from '../components/ActionPage';
import AirtableImage from '../components/AirtableImage';
import {
  boldPrimaryFontFace,
  monsterra,
  prettyShadow,
  titleStyle,
  proseFontFace,
} from './Styles';
import { MenuCard } from '../components/MenuCard';
import { MenuZone, MenuHLayout } from '../components/MenuZone';
import {
  displayNameOfOrderItem,
  addMenuItemToCartItem,
  getActiveBenefit,
} from '../ono-cloud/OnoKitchen';
import SmallTitle from './SmallTitle';
import DetailsSection from './DetailsSection';
import MainTitle from './MainTitle';
import DescriptionText from './DescriptionText';
import DetailText from './DetailText';
import FoodMenu from './FoodMenu';
import { BenefitSelector } from './Benefits';

function Ingredient({ ingredient }) {
  return (
    <View
      style={{
        alignItems: 'center',
        marginRight: 20,
        width: 100,
      }}
    >
      <AirtableImage
        image={ingredient['Ingredient Image']}
        style={{ width: 100, height: 80 }}
      />
      <Text
        style={{
          marginTop: 4,
          marginBottom: 11,
          textAlign: 'center',
          fontSize: 10,
          color: monsterra,
          ...boldPrimaryFontFace,
        }}
      >
        {ingredient.Name.toUpperCase()}
      </Text>
    </View>
  );
}

function Ingredients({ menuItem }) {
  return (
    <View
      style={{
        flex: 1,
        alignSelf: 'stretch',
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        width: 600,
      }}
    >
      {menuItem.Recipe.Ingredients.map(i => (
        <Ingredient ingredient={i.Ingredient} key={i.id} />
      ))}
    </View>
  );
}

function BlendPageContentPure({ menuItem, item, foodMenu, order }) {
  console.log('RENDER BLEND PAGEEE');

  let menuContent = null;
  if (menuItem && order) {
    menuContent = (
      <MenuZone>
        <MenuHLayout
          side={
            <MenuCard
              key={menuItem.id}
              title={menuItem['Display Name']}
              tag={menuItem.DefaultBenefitName}
              price={menuItem.Recipe['Sell Price']}
              photo={menuItem.Recipe['Recipe Image']}
              onPress={null}
              style={{ marginBottom: 116 }}
            />
          }
        >
          <DetailsSection>
            <MainTitle>{displayNameOfOrderItem(item, menuItem)}</MainTitle>
            <DescriptionText>{menuItem['Display Description']}</DescriptionText>
            <DetailText>
              {menuItem.Recipe['DisplayCalories']} Calories |{' '}
              {menuItem.Recipe['Nutrition Detail']}
            </DetailText>
            <BenefitSelector activeBenefit={getActiveBenefit(item, menuItem)} />
            <SmallTitle>Organic Ingredients</SmallTitle>
            <Ingredients menuItem={menuItem} />
          </DetailsSection>
        </MenuHLayout>
      </MenuZone>
    );
  }

  return (
    <React.Fragment>
      <View style={{ flex: 1, flexDirection: 'row' }}>{menuContent}</View>
      {foodMenu && <FoodMenu foodMenu={foodMenu} />}
    </React.Fragment>
  );
}

const BlendPageContent = React.memo(BlendPageContentPure);

export default function BlendPage({
  navigation,
  menuItem,
  item,
  setItemState,
  orderItemId,
  order,
  foodMenu,
  ...props
}) {
  const { navigate } = navigation;

  const actions = [
    {
      secondary: true,
      title: 'customize',
      onPress: () => {
        navigate({
          routeName: 'CustomizeBlend',
          key: `Customize-${orderItemId}`,
          params: { orderItemId, menuItemId: menuItem.id },
        });
      },
    },
    {
      title: 'add to cart',
      onPress: () => {
        setItemState(
          addMenuItemToCartItem({
            item: item && item.state,
            orderItemId,
            menuItem,
            itemType: 'blend',
          }),
        );
      },
    },
  ];

  return (
    <ActionPage actions={actions} {...props} navigation={navigation}>
      <BlendPageContent
        item={item}
        menuItem={menuItem}
        foodMenu={foodMenu}
        order={order}
      />
    </ActionPage>
  );
}

BlendPage.navigationOptions = ActionPage.navigationOptions;
