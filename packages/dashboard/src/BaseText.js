import React from 'react';
import Text from '../views/Text';
import { useTheme } from './Theme';
import { Responsive } from './Responsive';

function BaseText({
  children,
  bold,
  style,
  responsiveStyle,
  breakpoints,
  size = 'large', // 'small' | 'mmedium' | 'large'
  ...rest
}) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        ...theme.textStyles[size],
        ...responsiveStyle,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          fontFamily: theme.fonts.serif,
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

export default BaseText;
