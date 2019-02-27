import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '../../navigation-hooks/Hooks';
import { highlightPrimaryColor, boldPrimaryFontFace } from './Styles';

export default function BackButton({ style, backBehavior }) {
  const { goBack } = useNavigation();

  return (
    <TouchableOpacity
      style={{
        width: 84,
        height: 36,
        position: 'absolute',
        top: 16,
        left: 28,
        ...style,
      }}
      hitSlop={{
        top: 60,
        right: 100,
        bottom: 60,
        left: 100,
      }}
      onPress={backBehavior || goBack}
    >
      <Text
        style={{
          fontSize: 18,
          color: highlightPrimaryColor,
          ...boldPrimaryFontFace,
          lineHeight: 19,
          textAlign: 'center',
        }}
      >
        ‹ Back
      </Text>
    </TouchableOpacity>
  );
}
