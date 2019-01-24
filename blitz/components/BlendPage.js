import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import ActionPage from '../components/ActionPage';
import AirtableImage from '../components/AirtableImage';
import {
  titleStyle,
  detailTextStyle,
  descriptionTextStyle,
  boldPrimaryFontFace,
  menuZoneTopInset,
  monsterra,
} from '../../components/Styles';
import { MenuCard } from '../components/MenuCard';
import { MenuZone, MenuHLayout } from '../components/MenuZone';
import SHA1 from 'crypto-js/sha1';

const stringify = require('json-stable-stringify');

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
    <ScrollView
      style={{ flex: 1, alignSelf: 'stretch', height: 400 }}
      contentContainerStyle={{
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        width: 600,
      }}
    >
      {menuItem.Recipe.Ingredients.map(i => (
        <Ingredient ingredient={i.Ingredient} key={i.id} />
      ))}
    </ScrollView>
  );
}

function SmallTitle({ children }) {
  return (
    <Text
      style={{
        fontSize: 24,
        marginTop: 24,
        ...titleStyle,
      }}
    >
      {children}
    </Text>
  );
}

function MainTitle({ children }) {
  return (
    <Text
      style={{
        fontSize: 36,
        ...titleStyle,
      }}
    >
      {children}
    </Text>
  );
}

function DetailText({ children }) {
  return (
    <Text
      style={{
        ...detailTextStyle,
        marginTop: 16,
      }}
    >
      {children}
    </Text>
  );
}

function DescriptionText({ children }) {
  return (
    <Text
      style={{
        marginTop: 2,
        ...descriptionTextStyle,
      }}
    >
      {children}
    </Text>
  );
}

function DetailsSection({ children }) {
  return <View style={{ width: 580, marginLeft: 20 }}>{children}</View>;
}

export default function BlendPage({
  navigation,
  menuItem,
  item,
  setItem,
  orderItemId,
  order,
  ...props
}) {
  const { navigate } = navigation;

  let menuContent = null;
  console.log(JSON.stringify({ menuItem, order }));
  if (menuItem && order) {
    menuContent = (
      <MenuZone>
        <MenuHLayout
          side={
            <MenuCard
              key={menuItem.id}
              title={menuItem['Display Name']}
              tag={menuItem.DefaultFunctionName}
              price={menuItem.Recipe['Sell Price']}
              photo={menuItem.Recipe['Recipe Image']}
              onPress={null}
              style={{ marginTop: menuZoneTopInset }}
            />
          }
        >
          <DetailsSection>
            <MainTitle>{menuItem['Display Name']}</MainTitle>
            <DescriptionText>{menuItem['Display Description']}</DescriptionText>
            <DetailText>
              {menuItem.Recipe['DisplayCalories']} Calories |{' '}
              {menuItem.Recipe['Nutrition Detail']}
            </DetailText>
            <SmallTitle>Ingredients</SmallTitle>
            <Ingredients menuItem={menuItem} />
          </DetailsSection>
        </MenuHLayout>
      </MenuZone>
    );
  }
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
        console.log('garfunkel');
        let f0 = menuItem.IngredientCustomization[0].Ingredients;
        let failure = [f0[0], f0[1]];
        // failure = 123;
        console.log(SHA1(stringify(failure)).toString());
        console.log(failure.length);
        console.log(stringify(failure).length);
        console.log(stringify(failure));
        const nextItem = item
          ? {
              ...item,
              quantity: item.quantity + 1,
              menuItem: {
                ...menuItem,
                IngredientCustomization: null,
                // gotchamotherfucker: [...failure],
                // gotchamotherfucker: [failure[0], failure[1], failure[2]],
                // gotchamotherfucker: [failure[0], failure[1]],
                // gotchamotherfucker: failure,
                // gotchamotherfucker: [failure[0]],
              },
            }
          : {
              id: orderItemId,
              type: 'blend',
              menuItemId: menuItem.id,
              customization: null,
              quantity: 1,
            };
        setItem(nextItem);
      },
    },
  ];

  return (
    <ActionPage actions={actions} {...props} navigation={navigation}>
      <View style={{ flex: 1, flexDirection: 'row' }}>{menuContent}</View>
    </ActionPage>
  );
}

BlendPage.navigationOptions = ActionPage.navigationOptions;
