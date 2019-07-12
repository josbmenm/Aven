import React from 'react';
import Text from '../views/Text';
import { useTheme } from './Theme';
import { Responsive } from './Responsive';

function Heading({ children, style, responsiveStyle, breakpoints, ...rest }) {
  const theme = useTheme();
  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        fontSize: [24, 38],
        lineHeight: [32, 48],
        ...responsiveStyle,
      }}
    >
      <Text
        style={{
          color: theme.colors.monsterra,
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
