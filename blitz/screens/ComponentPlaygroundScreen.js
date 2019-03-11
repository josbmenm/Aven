import React, { useState, memo } from 'react';
import { View } from 'react-native';
import FadeTransition from '../../components/FadeTransition';
import GenericPage from '../../components/GenericPage';
import RowSection from '../../components/RowSection';
import Hero from '../../components/Hero';
import LinkRow from '../../components/LinkRow';
import OrderCompletePage from '../../components/OrderCompletePage';
import ReceiptPage from '../../components/ReceiptPage';
import SendReceiptPage from '../../components/SendReceiptPage';
import CollectNamePage from '../../components/CollectNamePage';
import OrderConfirmPage from '../../components/OrderConfirmPage';
import BlendPage from '../../components/BlendPage';
import FoodPage from '../../components/FoodPage';
import ProductHomePage from '../../components/ProductHomePage';
import CartSidebar from '../../components/CartSidebar';
import CustomizePage from '../../components/CustomizePage';
import createStackTransitionNavigator from '../../navigation-transitioner/createStackTransitionNavigator';

const menuItem = require('./exampleMenuItem.json');
const foodMenuItem = require('./exampleFoodMenuItem.json');
const orderSummary = require('./exampleOrderSummary.json');
const menu = require('./exampleMenu.json');

function CartSidebarExample(props) {
  return (
    <GenericPage {...props}>
      <CartSidebar {...props} />
    </GenericPage>
  );
}
CartSidebarExample.navigationOptions = GenericPage.navigationOptions;

function CustomizationExample(props) {
  let [customization, setCustomization] = useState({});
  return (
    <CustomizePage
      {...props}
      customizationState={customization}
      setCustomization={setCustomization}
    />
  );
}
CustomizationExample.navigationOptions = CustomizePage.navigationOptions;

const Components = {
  ProductHomePage: {
    Component: ProductHomePage,
    exampleProps: {
      menu,
    },
    icon: '🍽',
  },
  BlendPage: {
    Component: BlendPage,
    exampleProps: {
      menuItem,
      foodMenu: menu.food,
      item: { id: 'test' },
      setItemState: () => {},
      order: {},
      orderItemId: 'test',
    },
    icon: '🍹',
  },
  FoodPage: {
    Component: FoodPage,
    exampleProps: {
      blendsMenu: menu.blends,
      menuItem: foodMenuItem,
      item: { id: 'test' },
      setItemState: () => {},
      orderItemId: 'test',
    },
    icon: '🍩',
  },
  CartSidebar: {
    Component: CartSidebarExample,
    exampleProps: {
      summary: orderSummary,
    },
    icon: '📝',
  },
  CustomizationExample: {
    Component: CustomizationExample,
    exampleProps: {
      menuItem,
      cartItem: { id: 'emptyCartItem' },
      setCartItem: () => {},
    },
    icon: '🍍',
  },
  CollectNamePage: {
    Component: CollectNamePage,
    exampleProps: {},
    icon: '🧾',
  },
  OrderConfirmPage: {
    Component: OrderConfirmPage,
    exampleProps: {
      readerState: { example: 'readerState' },
      summary: orderSummary,
      cancelPayment: () => alert('Payment Cancelled'),
      skipPayment: () => alert('Payment Skipped'),
    },
    icon: '💸',
  },
  ReceiptPage: {
    Component: ReceiptPage,
    exampleProps: {},
    icon: '🧾',
  },
  SendReceiptSMS: {
    Component: SendReceiptPage,
    exampleProps: { type: 'sms' },
    icon: '📞',
  },
  SendReceiptEmail: {
    Component: SendReceiptPage,
    exampleProps: { type: 'email' },
    icon: '✉️',
  },
  OrderCompletePage: {
    Component: OrderCompletePage,
    exampleProps: {},
    icon: '✅',
  },
};

function ComponentPlaygroundScreenMemo({ navigation, ...props }) {
  return (
    <GenericPage
      backBehavior={() => {
        navigation.goBack();
      }}
      navigation={navigation}
      {...props}
    >
      <Hero title="Components" icon="🍹" />
      <RowSection>
        {Object.keys(Components).map(componentName => {
          const { icon } = Components[componentName];
          return (
            <LinkRow
              key={componentName}
              onPress={() => {
                navigation.navigate('Playground' + componentName);
              }}
              icon={icon || '🧱'}
              title={componentName}
            />
          );
        })}
      </RowSection>
    </GenericPage>
  );
}
const ComponentPlaygroundScreen = memo(ComponentPlaygroundScreenMemo);

const PlaygroundRoutes = {
  PlayHome: ComponentPlaygroundScreen,
};
Object.keys(Components).map(componentName => {
  const { Component, exampleProps } = Components[componentName];
  function PlaygroundScreen(props) {
    return <Component {...props} {...exampleProps} />;
  }
  PlaygroundRoutes['Playground' + componentName] = {
    screen: PlaygroundScreen,
    navigationOptions: Component.navigationOptions,
  };
});

const PlaygroundNavigator = createStackTransitionNavigator(PlaygroundRoutes, {
  ContainerView: FadeTransition,
});

export default PlaygroundNavigator;
