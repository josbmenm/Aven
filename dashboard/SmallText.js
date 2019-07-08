import React from 'react';
import Text from '../views/Text';
import { useTheme } from '../dashboard/Theme';
import { Responsive } from '../dashboard/Responsive';

function SmallText({
  children,
  bold,
  size,
  style,
  responsiveStyle,
  breakpoint,
  ...rest
}) {
  const theme = useTheme();
  let boldStyle = bold ? { fontFamily: theme.fonts.bold } : {};
  return (
    <Responsive
      breakpoint={breakpoint}
      style={{
        ...responsiveStyle,
      }}
    >
      <Text
        style={{
          color: theme.colors.monsterra,
          lineHeight: 20,
          fontFamily: theme.fonts.normal,
          letterSpacing: 0.3,
          fontSize: size === 'small' ? 10 : size === 'large' ? 12 : 11,
          ...boldStyle,
          ...style,
        }}
        {...rest}
      >
        {children}
      </Text>
    </Responsive>
  );
}

export default SmallText;
