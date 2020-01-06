import React from 'react';
import { Text } from 'react-native';
import { useTheme } from './Theme';

export default function LiteralText({
  children,
  theme: themeProp,
  bold = false,
  style,
  debug = false,
  ...rest
}) {
  const theme = useTheme(themeProp);
  return (
    <Text
      style={[
        {
          fontSize: theme.fontSize,
          lineHeight: theme.lineHeight,
          color: theme.colorForeground,
          fontFamily: theme.textFont,
          fontWeight: theme.fontWeight,
        },
        bold && { fontWeight: 'bold', fontFamily: theme.fontBold },
        debug && { backgroundColor: 'pink' },
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
