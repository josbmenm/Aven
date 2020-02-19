import React from 'react';
import { TouchableOpacity } from '@rn';
import VisualButton from './VisualButton';

function Button({
  onPress,
  onLongPress,
  title,
  variant = 'primary',
  type = 'solid',
  buttonStyle,
  titleStyle,
  disabled,
  style,
  ...rest
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={style}
      accesible="true"
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <VisualButton
        title={title}
        variant={variant}
        type={type}
        buttonStyle={buttonStyle}
        titleStyle={titleStyle}
        disabled={disabled}
        {...rest}
      />
    </TouchableOpacity>
  );
}

export default Button;
