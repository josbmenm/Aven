import React from 'react';
import Text from '../views/Text';
import { useTheme } from '../dashboard/Theme';
import { Responsive } from './Responsive';

function Title({ children, style, responsiveStyle, ...rest }) {
  const theme = useTheme();
  return (
    <Responsive
      style={{
        fontSize: [24, 28],
        lineHeight: [32, 48],
        ...responsiveStyle,
      }}
    >
      <Text style={{ ...theme.textStyles.title, ...style }} {...rest}>
        {children}
      </Text>
    </Responsive>
  );
}

export default Title;
