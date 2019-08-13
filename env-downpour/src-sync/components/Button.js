import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import VisualButton from '../dashboard/VisualButton';

const Button = ({
  onPress,
  onLongPress,
  title,
  secondary,
  buttonStyle,
  appearance,
  titleStyle,
  size,
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
        appearance={appearance}
        buttonStyle={buttonStyle}
        titleStyle={titleStyle}
        size={size}
        disabled={disabled}
        {...rest}
      />
    </TouchableOpacity>
  );
};

export default Button;
