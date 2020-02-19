import React from 'react';
import { Text } from '@aven/views';
import { useTheme } from './Theme';
import { Responsive } from './Responsive';

function Heading({
  children,
  style,
  responsiveStyle,
  size = 'medium', // 'small' | 'mmedium' | 'large'
  appearance = 'primary', // 'primary' | 'secondary'
  breakpoints,
  ...rest
}) {
  const theme = useTheme();
  const color = theme.colors[appearance] || theme.colors.primary;

  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        ...theme.headingStyles[size],
        ...responsiveStyle,
      }}
    >
      <Text
        style={{
          color: color,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          fontFamily: theme.fonts.bold,
          ...style,
        }}
        {...rest}
      >
        {children}
      </Text>
    </Responsive>
  );
}

export default Heading;
