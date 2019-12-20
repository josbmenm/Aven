import React from 'react';
import { Text } from 'react-native';
import { useTheme } from './Theme';

export default function LiteralText({
  children,
  theme: themeProp = {},
  ...rest
}) {
  const theme = useTheme(themeProp);
  return (
    <Text
      style={{
        fontSize: theme.textFontSize,
        lineHeight: theme.textLineHeight,
        color: theme.colorForeground,
        fontFamily: theme.textFont,
        fontWeight: theme.textFontWeight,
      }}
      {...rest}
    >
      {children}
    </Text>
  );
}
