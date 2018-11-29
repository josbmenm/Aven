import React, { Component } from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import GenericPage from '../components/GenericPage';
import Button from '../../components/Button';
import { withMenuItem, withRestaurant } from '../../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
const md5 = require('crypto-js/md5');

function Ingredient({ ingredient }) {
  const image = ingredient['Ingredient Image'];
  const origUrl = image && image[0] && image[0].url;
  const imageURI = `/_/kitchen.maui.onofood.co/Airtable/files/${md5(
    origUrl,
  ).toString()}.jpg`;

  console.log(ingredient.Name, imageURI);

  return (
    <View
      style={{
        alignItems: 'center',
        marginTop: 20,
        marginRight: 20,
        width: 180,
      }}
    >
      <AirtableImage
        image={ingredient['Ingredient Image']}
        style={{ width: 100, height: 100 }}
      />
      <Text
        style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 20,
          color: '#444',
        }}
      >
        {ingredient.Name.toUpperCase()}
      </Text>
    </View>
  );
}

function Ingredients({ menuItem }) {
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <View
        style={{
          padding: 10,
          paddingLeft: 30,
          backgroundColor: 'white',
          flexWrap: 'wrap',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {menuItem.Recipe.Ingredients.map(i => (
          <Ingredient ingredient={i.Ingredient} key={i.id} />
        ))}
      </View>
    </View>
  );
}

function ChooseBeverage({ menuItem }) {
  return (
    <View>
      {menuItem.Customization.Beverage.map(Ingredient => {
        return (
          <TouchableHighlight
            key={Ingredient.id}
            onPress={() => {
              alert(Ingredient.id);
            }}
          >
            <View>
              <Text>{Ingredient.Name}</Text>
            </View>
          </TouchableHighlight>
        );
      })}
    </View>
  );
}

class MenuItemScreenWithItem extends React.Component {
  render() {
    const { menuItem, setOrderItem, navigation, orderItemId } = this.props;
    if (!menuItem) {
      return null;
    }
    return (
      <GenericPage title={menuItem.name} disableScroll>
        <View style={{ padding: 0 }}>
          <Text style={{ fontSize: 42, marginBottom: 30, textAlign: 'center' }}>
            {menuItem['Display Name']}
          </Text>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, padding: 30 }}>
              <AirtableImage
                image={menuItem.Recipe['Recipe Image']}
                style={{ flex: 1, resizeMode: 'contain' }}
              />
              <Text
                style={{
                  fontSize: 32,
                  marginBottom: 30,
                  color: '#444',
                  margin: 20,
                }}
              >
                {menuItem['Display Description']}
              </Text>

              <Text style={{ fontSize: 52 }}>
                {menuItem.Price} - {menuItem.Calories} cal
              </Text>
            </View>
            <Ingredients menuItem={menuItem} />
          </View>

          <Button
            onPress={() => {
              setOrderItem(orderItemId, {
                menuItemId: menuItem.id,
              });
              navigation.navigate('OrderConfirm');
            }}
            title="Order Blend"
          />
          <ChooseBeverage menuItem={menuItem} />
          <Button onPress={() => {}} title="Customize" />
        </View>
      </GenericPage>
    );
  }
}

const MenuItemScreenWithId = withRestaurant(
  withMenuItem(MenuItemScreenWithItem),
);

export default class MenuItemScreen extends Component {
  render() {
    return (
      <MenuItemScreenWithId
        menuItemId={this.props.navigation.getParam('id')}
        orderItemId={this.props.navigation.getParam('orderItemId')}
        {...this.props}
      />
    );
  }
}
