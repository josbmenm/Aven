import React from 'react'
import Text from '../views/Text';
import { useTheme } from '../dashboard/Theme'

function Heading({ children, style, ...rest }) {
  const theme = useTheme();
  return (
    <Text style={{ ...theme.textStyles.heading, ...style }} {...rest}>
      {children}
    </Text>
  );
}

export default Heading;
