import React from 'react';
import Text from '../views/Text';
import { useTheme } from './Theme';
import { Responsive } from './Responsive';

function BodyText({
  children,
  bold,
  style,
  responsiveStyle,
  breakpoint,
  ...rest
}) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Responsive
      breakpoint={breakpoint}
      style={{
        fontSize: [15, 18],
        lineHeight: [24, 28],
        letterSpacing: [0.25, 0.3],
        ...responsiveStyle,
      }}
    >
      <Text style={[theme.textStyles.body, style, boldStyle]} {...rest}>
        {children}
      </Text>
    </Responsive>
  );
}

export default BodyText;
