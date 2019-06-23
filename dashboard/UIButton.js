import React from 'react';
import View from '../views/View';
import Text from '../views/Text';
import { useTheme } from './Theme';

function UIButton({
  buttonStyle,
  titleStyle,
  title = 'button',
  type = 'solid', // 'solid' | 'outline'
  variant = 'primary', // 'primary' | 'secondary'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled,
  ...rest
}) {
  const theme = useTheme();
  const buttonColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
      ? theme.colors.secondary
      : theme.colors.lightGrey;

  const buttonSize =
    size === 'small'
      ? {
          button: {
            paddingVertical: theme.space[1],
            paddingHorizontal: theme.space[4],
            borderRadius: theme.radii[1],
          },
          title: {
            fontSize: theme.fontSizes[1],
          },
        }
      : size === 'large'
      ? {
          button: {
            paddingVertical: theme.space[4],
            paddingHorizontal: theme.space[8],
            borderRadius: theme.radii[3],
          },
          title: {
            fontSize: theme.fontSizes[3],
          },
        }
      : {
          button: {
            paddingVertical: theme.space[2],
            paddingHorizontal: theme.space[6],
            borderRadius: theme.radii[2],
          },
          title: { fontSize: theme.fontSizes.body },
        };
  return (
    <View
      style={[
        {
          borderRadius: theme.radii[2],
          borderWidth: 3,
          justifyContent: 'center',
          borderColor: type === 'outline' ? buttonColor : 'transparent',
          backgroundColor: type === 'solid' ? buttonColor : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        buttonSize.button,
        buttonStyle,
      ]}
      {...rest}
    >
      <Text
        style={[
          {
            fontFamily: theme.fontFamily.button,
            textAlign: 'center',
            lineHeight: theme.fontSizes[2] * 1.4,
            color: type === 'solid' ? theme.colors.white : buttonColor,
          },
          buttonSize.title,
          titleStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

export default UIButton;
