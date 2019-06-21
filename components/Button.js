import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { StyledButton } from '../sneezy/Tokens';
import { useTheme } from '../sneezy/ThemeContext';

const Button = ({
  onPress,
  onLongPress,
  title,
  style,
  secondary,
  buttonStyle,
  titleStyle,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
    >
      <StyledButton title={title} buttonStyle={buttonStyle} titleStyle={titleStyle} disabled={disabled} />
    </TouchableOpacity>
  );
};

export default Button;
