import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { withNavigation } from '@react-navigation/core';
import {
  menuItemNameText,
  menuItemDescriptionText,
} from '../../ono-components/Styles';
import AirtableImage from './AirtableImage';

const MenuItemWithNav = ({ item, navigation }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('MenuItem', { id: item.id });
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
        <View style={{ flex: 1, marginLeft: 40, justifyContent: 'center' }}>
          {item.Recipe && (
            <AirtableImage
              image={item.Recipe['Recipe Image']}
              style={{ width: 100, height: 100 }}
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
    </TouchableOpacity>
  );
};
const MenuItem = withNavigation(MenuItemWithNav);

export default MenuItem;
