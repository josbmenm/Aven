import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ActionPage from './ActionPage';
import AirtableImage from './AirtableImage';
import {
  boldPrimaryFontFace,
  monsterra,
  prettyShadow,
  titleStyle,
  proseFontFace,
  largeHorizontalPadding,
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

function BackgroundLayout({ children, background }) {
  return (
    <View
      style={{
        paddingTop: 184,
        alignSelf: 'stretch',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1366,
          height: 1024,
        }}
      >
        {background}
      </View>
      {children}

      <View
        style={{
          height: 1,
          alignSelf: 'stretch',
          marginHorizontal: largeHorizontalPadding,
          backgroundColor: '#00000014',
        }}
      />
    </View>
  );
}

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
        image={ingredient['Image']}
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
          ...titleStyle,
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
    const dietary = Object.keys(menuItem.Dietary)
      .map(dId => menuItem.Dietary[dId])
      .filter(diet => {
        if (diet['Applies To All Ingredients']) {
          return true;
        }
        if (!diet.Ingredients) {
          return false;
        }
        if (
          selectedIngredientIds.find(
            ingId => diet.Ingredients.indexOf(ingId) === -1,
          )
        ) {
          return false;
        }
        return true;
      });
    // console.log('LOG FOR exampleMenuItem.json", JSON.stringify(menuItem));
    menuContent = (
      <BackgroundLayout
        background={
          <AirtableImage
            image={menuItem.Recipe.SplashImage}
            style={{ flex: 1 }}
          />
        }
      >
        <MenuHLayout
          side={null}
          //   <MenuCard
          //     isPhotoZoomed={true}
          //     key={menuItem.id}
          //     title={menuItem['Display Name']}
          //     tag={menuItem.DefaultEnhancementName}
          //     price={menuItem.Recipe['Sell Price']}
          //     photo={menuItem.Recipe['Recipe Image']}
          //     onPress={null}
          //     style={{ marginBottom: 116 }}
          //   />
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
                    paddingRight: 16,
                    alignItems: 'center',
                  }}
                >
                  <AirtableImage
                    image={b['Icon']}
                    tintColor={monsterra}
                    style={{
                      width: 64,
                      height: 64,
                    }}
                  />
                  <Text
                    style={{
                      ...boldPrimaryFontFace,
                      color: monsterra,
                      alignSelf: 'center',
                      letterSpacing: 0.5,
                      fontSize: 12,
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
                flexDirection: 'row',
              }}
            >
              {dietary.map(d => (
                <AirtableImage
                  key={d.id}
                  image={d.Icon}
                  style={{
                    width: 32,
                    marginRight: 8,
                    height: 32,
                  }}
                  tintColor={monsterra}
                />
              ))}
            </View>
            <SmallTitle>organic ingredients</SmallTitle>
            <Ingredients selectedIngredients={selectedIngredients} />
          </DetailsSection>
        </MenuHLayout>
      </BackgroundLayout>
    );
  }

  return (
    <React.Fragment>
      {menuContent}
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
