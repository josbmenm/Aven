import React from 'react';
import { Text } from 'react-native';
import { useTheme } from './Theme';
import { opacify } from './utils';

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
          color: opacify(theme.colorForeground, 0.8),
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
