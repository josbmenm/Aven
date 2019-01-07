import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import {
  menuItemNameText,
  menuItemDescriptionText,
  boldPrimaryFontFace,
  primaryFontFace,
  highlightPrimaryColor,
  mutedPrimaryColor,
  prettyShadow,
} from '../../components/Styles';
import AirtableImage from '../components/AirtableImage';
import { formatCurrency } from '../../components/Utils';

const MENU_ITEM_WIDTH = 350;

function Tag({ label }) {
  return (
    <View
      style={{
        backgroundColor: mutedPrimaryColor,
        padding: 3,
        borderRadius: 4,
        paddingHorizontal: 10,
        fontSize: 10,
      }}
    >
      <Text
        style={{
          ...boldPrimaryFontFace,
          color: 'white',
        }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

export default function MenuCard({ photo, title, price, tag, onPress }) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={{
          backgroundColor: 'white',
          padding: 40,
          width: MENU_ITEM_WIDTH,
          marginVertical: 30,
          alignItems: 'flex-end',
          ...prettyShadow,
          borderRadius: 8,
        }}
      >
        {tag && <Tag label={tag} />}
        {title && (
          <Text
            style={{
              fontSize: 32,
              paddingTop: 15,
              color: highlightPrimaryColor,
              textAlign: 'right',
              lineHeight: 24,
              ...boldPrimaryFontFace,
            }}
          >
            {title}
          </Text>
        )}
        {price && (
          <Text
            style={{
              fontSize: 16,
              ...boldPrimaryFontFace,
              color: mutedPrimaryColor,
            }}
          >
            {formatCurrency(price)}
          </Text>
        )}
        <View
          style={{
            flex: 1,
            marginLeft: 40,
            justifyContent: 'center',
            alignSelf: 'stretch',
          }}
        >
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
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
