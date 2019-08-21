import React from 'react';
import { Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '../navigation-hooks/Hooks';
import {
  highlightPrimaryColor,
  boldPrimaryFontFace,
  fontSmall,
  monsterra40,
} from './Styles';

export default function BackButton({ style, onLongPress, backBehavior }) {
  const { goBack } = useNavigation();

  return (
    <TouchableOpacity
      style={{
        width: 84,
        height: 36,
        position: 'absolute',
        top: 26,
        left: 32,
        flexDirection: 'row',
        ...style,
      }}
      hitSlop={{
        top: 60,
        right: 100,
        bottom: 60,
        left: 100,
      }}
      onPress={backBehavior || goBack}
      onLongPress={onLongPress}
    >
      <Image
        style={{ width: 12, height: 20, tintColor: monsterra40 }}
        source={require('./assets/BackChevron.png')}
      />
      <Text
        style={{
          ...fontSmall,
          color: highlightPrimaryColor,
          ...boldPrimaryFontFace,
          lineHeight: 19,
          textAlign: 'center',
          marginLeft: 12,
          marginTop: 2,
        }}
      >
        back
      </Text>
    </TouchableOpacity>
  );
}
