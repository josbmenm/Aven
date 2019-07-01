import React from 'react';
import View from '../views/View';
import Text from '../views/Text';
import { useTheme } from './Theme';

function UIButton({
  buttonStyle,
  titleStyle,
  title,
  type = 'solid', // 'solid' | 'outline'
  variant = 'primary', // 'primary' | 'secondary'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled,
  children,
  ...rest
}) {
  const theme = useTheme();
  const buttonBackgroundColor =
    variant === 'primary'
      ? theme.colors.primary80
      : variant === 'secondary'
      ? theme.colors.secondary80
      : theme.colors.lightGrey;

  const buttonColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
      ? theme.colors.secondary
      : theme.colors.lightGrey;

  const borderColor =
    variant === 'primary'
      ? theme.colors.primary80
      : variant === 'secondary'
      ? theme.colors.secondary80
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
          title: { fontSize: 20 },
        };
  return (
    <View
      style={[
        {
          borderRadius: theme.radii[2],
          borderWidth: 3,
          justifyContent: 'center',
          borderColor: type === 'outline' ? borderColor : 'transparent',
          backgroundColor:
            type === 'solid' ? buttonBackgroundColor : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        buttonSize.button,
        buttonStyle,
      ]}
      {...rest}
    >
      {children ? children : null}
      {title ? (
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
      ) : null}
    </View>
  );
}

export default UIButton;
