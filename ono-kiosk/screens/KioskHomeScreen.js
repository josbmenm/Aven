import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TouchableHighlight,
  AlertIOS,
  Image,
} from 'react-native';
import { createStackNavigator, withNavigation } from 'react-navigation';
import InputPage from '../components/InputPage';
import GenericPage from '../components/GenericPage';
import Title from '../../ono-components/Title';
import CallToActionButton from '../../ono-components/CallToActionButton';

const ProductLinkWithNav = ({ product, navigation }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('Product', { id: product.id });
      }}
    >
      <View
        style={{
          borderWidth: 1,
          padding: 40,
          marginHorizontal: 80,
          flexDirection: 'row',
          marginVertical: 30,
        }}
      >
        <PlaceholderImage
          color={product.color}
          style={{ width: 200, aspectRatio: 1 }}
        />
        <View style={{ flex: 1, marginLeft: 40, justifyContent: 'center' }}>
          <Text style={{ fontSize: 42, ...genericFont }}>{product.name}</Text>
          <Text style={{ ...genericFont }}>{product.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const ProductLink = withNavigation(ProductLinkWithNav);

const Products = [];

export default class KioskHomeScreen extends Component {
  render() {
    return (
      <GenericPage>
        <Title>Select a blend</Title>
        {Products.map(product => (
          <ProductLink product={product} key={product.id} />
        ))}
      </GenericPage>
    );
  }
}
