import React from 'react';
import View from '../views/View';
import Text from '../views/Text';
import { useTheme } from './Theme';
import { Responsive } from './Responsive';

function UIButton({
  buttonStyle = {},
  titleStyle,
  title,
  type = 'solid', // 'solid' | 'outline' | 'link'
  variant = 'primary', // 'primary' | 'secondary'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled,
  responsiveStyle,
  breakpoints,
  children,
  ...rest
}) {
  const theme = useTheme();

  let linkStyle =
    type === 'link'
      ? {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderColor: 'transparent',
          borderBottomWidth: 0,
        }
      : null;
  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        paddingVertical:
          buttonStyle.paddingVertical !== undefined
            ? [buttonStyle.paddingVertical, buttonStyle.paddingVertical]
            : [9, 12],
        paddingHorizontal:
          buttonStyle.paddingHorizontal !== undefined
            ? [buttonStyle.paddingHorizontal, buttonStyle.paddingHorizontal]
            : [20, 24],
        ...responsiveStyle,
      }}
    >
      <View
        style={{
          borderRadius: theme.radii[2],
          borderWidth: 3,
          justifyContent: 'center',
          borderColor:
            type === 'outline' ? theme.colors.monsterras[0] : 'transparent',
          backgroundColor:
            type === 'solid' ? theme.colors.monsterras[0] : 'transparent',
          opacity: disabled ? 0.5 : 1,
          ...linkStyle,
          ...buttonStyle,
        }}
        {...rest}
      >
        {children ? children : null}
        {title ? (
          <Text
            style={{
              fontFamily: theme.fonts.bold,
              fontSize: 20,
              lineHeight: 24,
              textAlign: 'center',
              color:
                type === 'solid' ? theme.colors.white : theme.colors.monsterra,
              ...titleStyle,
            }}
          >
            {title}
          </Text>
        ) : null}
      </View>
    </Responsive>
  );
}

export default UIButton;
