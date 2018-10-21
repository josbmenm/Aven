import React, { Component } from 'react';
import { View, StatusBar, Image } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from '@react-navigation/native';
import { genericText } from '../../ono-components/Styles';
import GenericPage from '../components/GenericPage';

const Products = [];

const PlaceholderImage = () => <View />;

const Features = ({ product }) => (
  <View style={{ flexDirection: 'row', marginBottom: 60 }}>
    {product.features.map(feature => (
      <View
        style={{ alignItems: 'center', marginTop: 20, marginRight: 20 }}
        key={feature.name}
      >
        <PlaceholderImage
          style={{ width: 100, height: 100, marginBottom: 30 }}
          color="#22cc22"
        />
        <Text
          style={{
            flex: 1,
            ...genericText,
            marginRight: 60,
            marginTop: 8,
            textAlign: 'center',
            alignSelf: 'center',
            fontSize: ingredientFontSize,
          }}
        >
          {feature.name}
        </Text>
      </View>
    ))}
  </View>
);

const Ingredients = ({ product }) => (
  <View style={{ flexDirection: 'row', padding: 0 }}>
    {product.ingredients.map(i => (
      <View
        style={{ alignItems: 'center', marginTop: 20, marginRight: 20 }}
        key={i.name}
      >
        <PlaceholderImage
          style={{ width: 100, height: 100, marginBottom: 30 }}
          color="#22cc22"
        />
        <Text
          style={{
            ...genericText,
            fontSize: ingredientFontSize,
            marginTop: 8,
            textAlign: 'center',
            minWidth: 190,
          }}
        >
          {i.name}
        </Text>
      </View>
    ))}
  </View>
);

export default class MenuItemScreen extends Component {
  render() {
    const id = this.props.navigation.getParam('id');
    debugger;
    const product = Products.find(p => p.id === id);
    return (
      <GenericPage {...this.props} title={product.name} disableScroll>
        <PlaceholderImage
          color={product.color}
          style={{
            aspectRatio: 3,
            alignSelf: 'stretch',
          }}
        />
        <ScreenContent>
          <View style={{ padding: 30 }}>
            <Features product={product} />
            <Text style={{ ...genericText, fontSize: 42, marginBottom: 30 }}>
              {product.description}
            </Text>
            <Text style={{ ...genericText, fontSize: 52 }}>
              <Text style={{ fontSize: 54 }}>ingredients | </Text>
              {product.size} - {product.nutrition}
            </Text>
            <Ingredients product={product} />
          </View>
        </ScreenContent>
        <CallToActionButton
          label="Checkout"
          onPress={() => {
            this.props.navigation.navigate('Payment', { id });
          }}
        />
      </GenericPage>
    );
  }
}
