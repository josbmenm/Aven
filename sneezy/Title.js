import React from 'react';
import Text from '../views/Text';
import { useTheme } from '../dashboard/Theme';

function Title({ children, style, ...rest }) {
  const theme = useTheme();
  return (
    <Text style={{ ...theme.textStyles.title, ...style }} {...rest}>
      {children}
    </Text>
  );
}

export default Title;
