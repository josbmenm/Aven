import React from 'react';
import Text from '../views/Text';
import { useTheme } from '../dashboard/Theme';
import { Responsive } from '../dashboard/Responsive';

function FootNote({ children, bold, style, responsiveStyle, breakpoint, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontFamily: theme.fonts.bold } : {};
  return (
    <Responsive
      breakpoint={breakpoint}
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
