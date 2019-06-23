import React from 'react'
import Text from '../views/Text'
import { useTheme} from '../dashboard/Theme';

function BodyText({ children, bold, style, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Text
      style={[theme.textStyles.body, style, boldStyle]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export default BodyText;
