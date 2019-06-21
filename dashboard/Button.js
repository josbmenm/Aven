import React from 'react';
import { TouchableOpacity } from 'react-native';
import View from '../views/View';
import Text from '../views/Text';
import { useTheme } from './Theme';

export function StyledButton({
  buttonStyle,
  titleStyle,
  title,
  type = 'solid',
  disabled,
  ...rest
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          borderRadius: theme.radii[2],
          borderWidth: 3,
          paddingVertical: theme.spaces[4],
          paddingHorizontal: theme.spaces[8],
          justifyContent: 'center',
          borderColor:
            type === 'outline' ? theme.colors.primary80 : 'transparent',
          backgroundColor:
            type === 'solid' ? theme.colors.primary80 : 'transparent',
          cursor: disabled ? 'no-drop' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        },
        buttonStyle,
      ]}
      {...rest}
    >
      <Text
        style={[
          {
            fontFamily: theme.fontFamily.button,
            fontSize: theme.fontSizes[2],
            textAlign: 'center',
            lineHeight: theme.fontSizes[2] * 1.2,
            color: type === 'solid' ? theme.colors.white : theme.colors.primary,
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

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
