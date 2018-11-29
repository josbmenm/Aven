import React, { Component } from 'react';
import { Text, View, TouchableWithoutFeedback } from 'react-native';
import { withNavigation } from '@react-navigation/core';
import {
  menuItemNameText,
  menuItemDescriptionText,
} from '../../components/Styles';
import AirtableImage from './AirtableImage';
import uuid from 'uuid/v1';

const MenuItemWithNav = ({ item, navigation }) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate('MenuItem', { id: item.id, orderItemId: uuid() });
      }}
    >
      <View
        style={{
          backgroundColor: 'white',
          padding: 40,
          width: 500,
          marginHorizontal: 80,
          flexDirection: 'row',
          marginVertical: 30,
        }}
      >
        <View style={{ flex: 1, marginLeft: 40, justifyContent: 'center' }}>
          {item.Recipe && (
            <AirtableImage
              image={item.Recipe['Recipe Image']}
              style={{
                height: 200,
                alignSelf: 'stretch',
                resizeMode: 'contain',
              }}
            />
          )}
          <Text style={{ fontSize: 42, ...menuItemNameText }}>
            {item['Display Name']}
          </Text>
          <Text style={{ ...menuItemDescriptionText }}>
            {item['Display Description']}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
const MenuItem = withNavigation(MenuItemWithNav);

export default MenuItem;
