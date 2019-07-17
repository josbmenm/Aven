import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import VisualButton from '../dashboard/VisualButton';

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
      style={style}
    >
      <VisualButton
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
