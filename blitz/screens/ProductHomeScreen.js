import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import GenericPage from '../components/GenericPage';
import { withMenu, useMenu } from '../../ono-cloud/OnoKitchen';

import { withNavigation } from '../../navigation-core';
import {
  menuItemNameText,
  menuItemDescriptionText,
  titleStyle,
} from '../../components/Styles';
import AirtableImage from '../components/AirtableImage';
import uuid from 'uuid/v1';

import { useNavigation } from '../../navigation-hooks/Hooks';
import OrderSidebar from '../components/OrderSidebar';

import MenuCard from '../components/MenuCard';

const MENU_ITEM_WIDTH = 350;

const titleLargeStyle = {
  fontSize: 52,
  ...titleStyle,
};
const titleSmallStyle = {
  fontSize: 42,
  ...titleStyle,
};

function TitleLarge({ title }) {
  return <Text style={titleLargeStyle}>{title}</Text>;
}

function TitleSmall({ title }) {
  return <Text style={titleSmallStyle}>{title}</Text>;
}

function MenuSection({ title, children }) {
  return (
    <View
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
      }}
    >
      {title}
      <ScrollView
        pagingEnabled={true}
        snapToInterval={MENU_ITEM_WIDTH}
        horizontal
        style={{ flex: 1 }}
        contentContainerStyle={{}}
        showsHorizontalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function BlendsMenu({ menu }) {
  const { navigate } = useNavigation();
  return (
    <MenuSection title={<TitleLarge title="choose a blend" />}>
      {menu.map(item => (
        <MenuCard
          key={item.id}
          title={item['Display Name']}
          price={item.Recipe['Sell Price']}
          tag={item.DefaultFunctionName}
          photo={item.Recipe && item.Recipe['Recipe Image']}
          onPress={() => {
            navigate('MenuItem', {
              id: item.id,
              orderItemId: uuid(),
            });
          }}
        />
      ))}
    </MenuSection>
  );
}

function FoodMenu({ menu }) {
  return (
    <MenuSection title={<TitleSmall title="add a snack" />}>
      {menu.map(item => (
        <MenuCard
          key={item.id}
          title={item['Name']}
          description={item['Display Description']}
          photo={item.Photo}
          onPress={null}
        />
      ))}
    </MenuSection>
  );
}

export default function KioskHomeScreen() {
  const menu = useMenu();
  if (!menu) {
    return null;
  }
  return (
    <GenericPage afterScrollView={<OrderSidebar />}>
      <BlendsMenu menu={menu.blends} />
      <FoodMenu menu={menu.food} />
    </GenericPage>
  );
}
