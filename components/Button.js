import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { StyledButton } from '../sneezy/Tokens';

const Button = ({
  onPress,
  onLongPress,
  title,
  secondary,
  buttonStyle,
  titleStyle,
  disabled,
  style,
  ...rest
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={[{ paddingHorizontal: 8 }, style]}
    >
      <StyledButton
        title={title}
        buttonStyle={buttonStyle}
        titleStyle={titleStyle}
        disabled={disabled}
        {...rest}
      />
    </TouchableOpacity>
  );
};

export default Button;
