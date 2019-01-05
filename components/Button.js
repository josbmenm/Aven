import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import {
  buttonStyle,
  buttonTitleStyle,
  secondaryButtonStyle,
  secondaryButtonTitleStyle,
} from './Styles';

const Button = ({ onPress, title, style, secondary }) => {
  const viewStyle = secondary ? secondaryButtonStyle : buttonStyle;
  const titleStyle = secondary ? secondaryButtonTitleStyle : buttonTitleStyle;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', ...viewStyle }}
    >
      <Text style={titleStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
