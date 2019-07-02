import React from 'react'
import Text from '../views/Text'
import { useTheme } from '../dashboard/Theme';
import { Responsive } from './Responsive';

function BodyText({ children, bold, style, className, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Responsive style={{
      fontSize: [15, 18],
      lineHeight: [24, 28],
      letterSpacing: [.25, .3]
    }}
    className={className}>
    <Text
      style={[theme.textStyles.body, style, boldStyle]}
      {...rest}
    >
      {children}
    </Text>
    </Responsive>
  );
}

export default BodyText;
