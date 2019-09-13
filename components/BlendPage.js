import React from 'react';
import { View, Text } from 'react-native';
import ActionPage from './ActionPage';
import AirtableImage from './AirtableImage';
import { boldPrimaryFontFace, monsterra, titleStyle } from './Styles';
import { Tag } from '../components/MenuCard';
import { MenuHLayout } from '../components/MenuZone';
import formatCurrency from '../utils/formatCurrency';
import { dietaryInfosOfMenuItem } from '../logic/configLogic';
import {
  displayNameOfOrderItem,
  addMenuItemToCartItem,
  getSellPriceOfItem,
  useSelectedIngredients,
} from '../ono-cloud/OnoKitchen';
import SmallTitle from './SmallTitle';
import DetailsSection from './DetailsSection';
import MainTitle from './MainTitle';
import DescriptionText from './DescriptionText';
import DetailText from './DetailText';

function BackgroundLayout({ children, background, photoHasMargin }) {
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
          top: photoHasMargin ? -256 : null,
          left: 0,
          width: 1366,
          height: 1024,
          overflow: 'visible',
          flexDirection: 'row',
        }}
      >
        {background}
      </View>
      {children}

      {/* <View
        style={{
          height: 1,
          alignSelf: 'stretch',
          marginHorizontal: largeHorizontalPadding,
          backgroundColor: '#00000014',
        }}
      /> */}
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

function BlendPageContentPure({ menuItem, setItemState, item, order }) {
  if (!menuItem) {
    return null;
  }
  let fills = menuItem.inStockFills;
  if (menuItem['Forced Available']) {
    fills = menuItem.stockItemFills;
  }
  const ingredients = fills.map(fill => {
    return fill.inventory.Ingredient;
  });
  const selectedIngredientIds = ingredients.map(i => i.id);
  const benefits = (menuItem ? Object.keys(menuItem.AllBenefits) : [])
    .map(benefitId => {
      const benefit = menuItem.AllBenefits[benefitId];
      if (menuItem.DefaultBenefit && menuItem.DefaultBenefit.id === benefitId) {
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
  const detailText =
    menuItem &&
    `${menuItem.Recipe['DisplayCalories']} Calories | ${
      menuItem.Recipe['Nutrition Detail']
    }`;

  const dietaryInfos = dietaryInfosOfMenuItem(menuItem, selectedIngredientIds);

  return (
    <BackgroundLayout
      photoHasMargin
      background={
        <AirtableImage
          image={menuItem.Recipe.SplashImage}
          style={{ flex: 1, aspectRatio: 2732 / 2560 }}
        />
      }
    >
      <MenuHLayout side={null}>
        <DetailsSection>
          <View style={{ alignSelf: 'flex-start', marginBottom: 5 }}>
            <Tag tag={menuItem.DefaultBenefitName} />
          </View>
          <MainTitle
            subtitle={formatCurrency(getSellPriceOfItem(item, menuItem))}
          >
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
            {dietaryInfos &&
              dietaryInfos.map(d => (
                <View style={{ alignItems: 'center', marginRight: 16 }}>
                  <AirtableImage
                    key={d.id}
                    image={d.Icon}
                    style={{
                      width: 32,
                      height: 32,
                      marginBottom: 4,
                    }}
                    tintColor={monsterra}
                  />
                  <Text
                    style={{
                      ...titleStyle,
                      fontSize: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    {d.Name}
                  </Text>
                </View>
              ))}
          </View>
          <SmallTitle>organic ingredients</SmallTitle>
          <Ingredients selectedIngredients={ingredients} />
        </DetailsSection>
      </MenuHLayout>
    </BackgroundLayout>
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

  const isCustomizable =
    menuItem && menuItem.Recipe && menuItem.Recipe.Customizable;

  const actions = [
    isCustomizable && {
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
            customization: null,
          }),
        );
      },
    },
  ];

  return (
    <ActionPage
      actions={actions.filter(Boolean)}
      {...props}
      navigation={navigation}
    >
      <BlendPageContent
        item={item}
        menuItem={menuItem}
        foodMenu={foodMenu}
        order={order}
        setItemState={setItemState}
      />
    </ActionPage>
  );
}

BlendPage.navigationOptions = ActionPage.navigationOptions;
