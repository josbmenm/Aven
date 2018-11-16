import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { buttonStyle, buttonTitleStyle } from './Styles';

const Button = ({ onPress, title }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ ...buttonStyle, flexDirection: 'row' }}
    >
      <Text style={buttonTitleStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
