import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import AirtableImage from '../components/AirtableImage';
import {
  prettyShadowSmall,
  titleStyle,
  proseFontFace,
  monsterra,
  monsterra40,
} from './Styles';

export function BenefitDetail({ benefit, showChevron }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        padding: 12,
      }}
    >
      <AirtableImage
        image={benefit.Photo}
        style={{ width: 36, height: 36, marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ ...titleStyle, fontSize: 12 }}>
            {benefit.Name.toUpperCase()}
          </Text>
          {showChevron && (
            <Image
              style={{
                width: 7,
                height: 11,
                tintColor: monsterra40,
                marginTop: 2,
                marginLeft: 8,
              }}
              source={require('../assets/RightChevronSmall.png')}
            />
          )}
        </View>
        <Text style={{ ...proseFontFace, fontSize: 13, color: monsterra }}>
          {benefit.Description}
        </Text>
      </View>
    </View>
  );
}

export function BenefitSelector({ activeBenefit }) {
  if (!activeBenefit) {
    return <Text>No benefit</Text>;
  }
  return (
    <TouchableOpacity
      style={{ marginTop: 16, flexDirection: 'row' }}
      onPress={() => {}}
    >
      <BenefitDetail benefit={activeBenefit} showChevron />
    </TouchableOpacity>
  );
}
