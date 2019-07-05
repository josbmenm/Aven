import React from 'react';
import View from '../views/View';
import Text from '../views/Text';
import { useTheme } from './Theme';
import { Responsive } from './Responsive';

function UIButton({
  buttonStyle = {},
  titleStyle,
  title,
  type = 'solid', // 'solid' | 'outline'
  variant = 'primary', // 'primary' | 'secondary'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled,
  responsiveStyle,
  breakpoint,
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

  return (
    <Responsive
      breakpoint={breakpoint}
      style={{
        paddingVertical:
          buttonStyle.paddingVertical !== undefined
            ? [buttonStyle.paddingVertical, buttonStyle.paddingVertical]
            : [9, 16],
        paddingHorizontal:
          buttonStyle.paddingHorizontal !== undefined
            ? [buttonStyle.paddingHorizontal, buttonStyle.paddingHorizontal]
            : [24, 32],
        ...responsiveStyle,
      }}
    >
      <View
        style={{
          borderRadius: theme.radii[2],
          borderWidth: 3,
          justifyContent: 'center',
          borderColor: type === 'outline' ? borderColor : 'transparent',
          backgroundColor:
            type === 'solid' ? buttonBackgroundColor : 'transparent',
          opacity: disabled ? 0.5 : 1,
          ...buttonStyle,
        }}
        {...rest}
      >
        {children ? children : null}
        {title ? (
          <Text
            style={[
              {
                fontFamily: theme.fontFamily.button,
                fontSize: 20,
                lineHeight: 24,
                textAlign: 'center',
                color: type === 'solid' ? theme.colors.white : buttonColor,
              },
              titleStyle,
            ]}
          >
            {title}
          </Text>
        ) : null}
      </View>
    </Responsive>
  );
}

export default UIButton;
