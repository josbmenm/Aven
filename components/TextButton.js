import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { textButtonStyle, textButtonContainerStyle } from './Styles';

export default function TextButton({ onPress, title }) {
  return (
    <TouchableOpacity onPress={onPress} style={textButtonContainerStyle}>
      <Text style={textButtonStyle}>{title}</Text>
    </TouchableOpacity>
  );
}
