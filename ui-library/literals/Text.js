import React from 'react';
import { Text as BaseText } from 'react-native';
import { useTheme, ThemeDebugger } from '../Theme';

export default function Text({ children, fontFamily, fontWeight, ...rest }) {
  const theme = useTheme();
  const font = fontFamily || theme.fonts.regular;
  console.log('TCL: Text -> font', font);
  return (
    <BaseText
      style={{
        fontSize: theme.fontSize,
        lineHeight: theme.lineHeight,
        color: theme.colors.foreground,
        fontFamily: font,
        fontWeight,
      }}
      {...rest}
    >
      <ThemeDebugger label="Text" />
      {children}
    </BaseText>
  );
}
