import React from 'react';
import Text from '../views/Text';
import { useTheme } from '../dashboard/Theme';
import { Responsive } from '../dashboard/Responsive';

function Heading({ children, style, responsiveStyle, ...rest }) {
  const theme = useTheme();
  return (
    <Responsive
      style={{
        fontSize: [24, 38],
        lineHeight: [32, 48],
        ...responsiveStyle,
      }}
    >
      <Text style={[theme.textStyles.heading, style]} {...rest}>
        {children}
      </Text>
    </Responsive>
  );
}

export default Heading;
