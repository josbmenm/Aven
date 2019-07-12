import React from 'react';
import Text from '../views/Text';
import { useTheme } from './Theme';
import { Responsive } from './Responsive';

function BodyText({
  children,
  bold,
  style,
  responsiveStyle,
  breakpoints,
  ...rest
}) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        fontSize: [15, 18],
        lineHeight: [24, 28],
        letterSpacing: [0.25, 0.3],
        ...responsiveStyle,
      }}
    >
      <Text
        style={{
          color: theme.colors.monsterra,
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

export default BodyText;
