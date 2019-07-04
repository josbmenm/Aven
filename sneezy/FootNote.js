import React from 'react';
import Text from '../views/Text';
import { useTheme } from '../dashboard/Theme';
import { Responsive } from '../dashboard/Responsive';

function FootNote({ children, bold, style, responsiveStyle, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Responsive
      style={{
        ...responsiveStyle,
      }}
    >
      <Text
        style={[{ ...theme.textStyles.footnote, ...boldStyle }, style]}
        {...rest}
      >
        {children}
      </Text>
    </Responsive>
  );
}

export default FootNote;
