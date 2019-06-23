import React from 'react';
import Text from '../views/Text';
import { useTheme } from '../dashboard/Theme';

function FootNote({ children, bold, style, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Text
      style={[{ ...theme.textStyles.footnote, ...boldStyle }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export default FootNote;
