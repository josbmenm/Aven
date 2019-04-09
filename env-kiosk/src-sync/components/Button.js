import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import {
  buttonStyle,
  buttonTitleStyle,
  secondaryButtonStyle,
  secondaryButtonTitleStyle,
} from './Styles';

const Button = ({ onPress, title, style, secondary, disabled }) => {
  const viewStyle = secondary ? secondaryButtonStyle : buttonStyle;
  const titleStyle = secondary ? secondaryButtonTitleStyle : buttonTitleStyle;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        ...viewStyle,
        ...style,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ ...titleStyle, alignSelf: 'center' }}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
