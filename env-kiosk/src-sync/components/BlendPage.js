import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ActionPage from './ActionPage';
import AirtableImage from './AirtableImage';
import {
  boldPrimaryFontFace,
  monsterra,
  prettyShadow,
  titleStyle,
  proseFontFace,
} from './Styles';
import { MenuCard } from '../components/MenuCard';
import { MenuZone, MenuHLayout } from '../components/MenuZone';
import { formatCurrency } from './Utils';
import {
  displayNameOfOrderItem,
  addMenuItemToCartItem,
  getActiveEnhancement,
} from '../ono-cloud/OnoKitchen';
import SmallTitle from './SmallTitle';
import DetailsSection from './DetailsSection';
import MainTitle from './MainTitle';
import DescriptionText from './DescriptionText';
import DetailText from './DetailText';
import FoodMenu from './FoodMenu';
import { EnhancementSelector } from './Enhancements';

function Ingredient({ ingredient }) {
  return (
    <View
      style={{
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 30,
        width: 180,
      }}
    >
      <AirtableImage
        image={ingredient['Ingredient Image']}
        style={{
          //width: 100, height: 80
          width: 180,
          height: 120,
        }}
      />
      <Text
        style={{
          marginTop: 4,
          marginBottom: 11,
          textAlign: 'center',
          fontSize: 12,
          color: monsterra,
          ...boldPrimaryFontFace,
        }}
      >
        {ingredient.Name && ingredient.Name.toUpperCase()}
      </Text>
    </View>
  );
}

function getSelectedIngredients(menuItem, cartItem) {
  if (
    !cartItem ||
    !cartItem.customization ||
    !cartItem.customization.ingredients
  ) {
    return menuItem.Recipe.Ingredients.map(
      recipeIngredient => recipeIngredient.Ingredient,
    );
  }
  const ings = cartItem.customization.ingredients;
  // todo, calculate real current ingredients
  return [];
}

function Ingredients({ selectedIngredients }) {
  return (
    <View
      style={{
        flex: 1,
        alignSelf: 'stretch',
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 68,
        width: 600,
      }}
    >
      {selectedIngredients.map(i => (
        <Ingredient ingredient={i} key={i.id} />
      ))}
    </View>
  );
}

function BlendPageContentPure({
  menuItem,
  setItemState,
  item,
  foodMenu,
  order,
  onPendingEnhancement,
}) {
  let menuContent = null;
  if (menuItem && order) {
    let activeEnhancement = getActiveEnhancement(item, menuItem);
    let [pendingActiveEnhancement, setPendingActiveEnhancement] = useState(
      null,
    );
    if (!item && pendingActiveEnhancement) {
      activeEnhancement =
        menuItem.BenefitCustomization[pendingActiveEnhancement];
    }
    const selectedIngredients = getSelectedIngredients(menuItem, item);
    const selectedIngredientIds = selectedIngredients.map(i => i.id);
    const benefits = Object.keys(menuItem.tables.Benefits)
      .map(benefitId => {
        const benefit = menuItem.tables.Benefits[benefitId];
        if (
          menuItem.DefaultBenefitEnhancement &&
          menuItem.DefaultBenefitEnhancement.id === benefitId
        ) {
          return benefit;
        }
        const benefitingIngredients = benefit.Ingredients.filter(
          ingId => selectedIngredientIds.indexOf(ingId) !== -1,
        );
        if (benefitingIngredients.length > 0) {
          return benefit;
        }
        return null;
      })
      .filter(Boolean);
    const detailText = `${menuItem.Recipe['DisplayCalories']} Calories | ${
      menuItem.Recipe['Nutrition Detail']
    }`;
    menuContent = (
      <MenuZone>
        <MenuHLayout
          side={
            <MenuCard
              isPhotoZoomed={true}
              key={menuItem.id}
              title={menuItem['Display Name']}
              tag={menuItem.DefaultEnhancementName}
              price={menuItem.Recipe['Sell Price']}
              photo={menuItem.Recipe['Recipe Image']}
              onPress={null}
              style={{ marginBottom: 116 }}
            />
          }
        >
          <DetailsSection>
            <MainTitle subtitle={formatCurrency(menuItem.Recipe['Sell Price'])}>
              {displayNameOfOrderItem(item, menuItem)}
            </MainTitle>
            <View style={{ flexDirection: 'row' }}>
              {benefits.map(b => (
                <View
                  key={b.id}
                  style={{
                    paddingVertical: 2,
                    paddingRight: 12,
                    alignItems: 'center',
                  }}
                >
                  <AirtableImage
                    image={b['Icon']}
                    style={{
                      width: 75,
                      height: 75,
                    }}
                  />
                  <Text
                    style={{
                      ...boldPrimaryFontFace,
                      color: monsterra,
                      alignSelf: 'center',
                    }}
                  >
                    {b.Name.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
            <DescriptionText>{menuItem['Display Description']}</DescriptionText>
            <DetailText>{detailText}</DetailText>
            <View
              style={{
                marginTop: 27,
                height: 32,
                width: 32,
                borderRadius: 16,
                backgroundColor: 'black',
              }}
            />
            <SmallTitle>organic ingredients</SmallTitle>
            <Ingredients selectedIngredients={selectedIngredients} />
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

  const [pendingEnhancement, setPendingEnhancement] = useState(null);

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
            customization: pendingEnhancement
              ? { enhancement: pendingEnhancement }
              : {},
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
        setItemState={setItemState}
        onPendingEnhancement={setPendingEnhancement}
      />
    </ActionPage>
  );
}

BlendPage.navigationOptions = ActionPage.navigationOptions;
