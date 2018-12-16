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
import Button from '../../components/Button';
import { withMenu, useOrderSummary } from '../../ono-cloud/OnoKitchen';

import { withNavigation } from '../../navigation-core';
import {
  menuItemNameText,
  menuItemDescriptionText,
} from '../../components/Styles';
import AirtableImage from '../components/AirtableImage';
import uuid from 'uuid/v1';

import { useNavigation } from '../../navigation-hooks/Hooks';
import useEmptyOrderEscape from '../useEmptyOrderEscape';

const MENU_ITEM_WIDTH = 350;

const MenuItemWithNav = ({ photo, description, title, onPress }) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={{
          backgroundColor: 'white',
          padding: 40,
          width: MENU_ITEM_WIDTH,
          flexDirection: 'row',
          marginVertical: 30,
        }}
      >
        <View style={{ flex: 1, marginLeft: 40, justifyContent: 'center' }}>
          {photo && (
            <AirtableImage
              image={photo}
              style={{
                height: 200,
                alignSelf: 'stretch',
                resizeMode: 'contain',
              }}
            />
          )}
          {title && (
            <Text style={{ fontSize: 42, ...menuItemNameText }}>{title}</Text>
          )}
          {description && (
            <Text style={{ ...menuItemDescriptionText }}>{description}</Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
const MenuItem = withNavigation(MenuItemWithNav);

function MenuSection({ title, children }) {
  return (
    <View
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
      }}
    >
      <Text style={{ fontSize: 42 }}>{title}</Text>
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
    <MenuSection title="Blends">
      {menu.map(item => (
        <MenuItem
          key={item.id}
          title={item['Display Name']}
          description={item['Display Description']}
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
    <MenuSection title="Bites">
      {menu.map(item => (
        <MenuItem
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

function OrderItem({ item }) {
  return <Text>{item.id}</Text>;
}

function OrderPanel() {
  const { navigate } = useNavigation();
  const summary = useOrderSummary();
  useEmptyOrderEscape();

  if (!summary) {
    return null;
  }
  console.log('ORDER SUMMARY');
  return (
    <View style={{}}>
      {summary.items.map(item => (
        <OrderItem item={item} key={item.id} />
      ))}
      <Button
        title="Checkout"
        onPress={() => {
          navigate('OrderConfirm');
        }}
      />
      <Button
        title="Cancel Order"
        onPress={() => {
          navigate('KioskHome');
        }}
      />
    </View>
  );
}

function OrderPanelOverlay() {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 300,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderLeftColor: 'blue',
      }}
    >
      <OrderPanel />
    </View>
  );
}

const Home = ({ blendMenu, foodMenu, navigation }) => {
  return (
    <GenericPage afterScrollView={<OrderPanelOverlay />}>
      <BlendsMenu menu={blendMenu} />
      <FoodMenu menu={foodMenu} />
    </GenericPage>
  );
};
const KioskHomeScreen = withMenu(Home);
export default KioskHomeScreen;
