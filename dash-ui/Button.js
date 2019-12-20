import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from './Theme';
import { opacify, useStatusColor } from './utils';

export default function Button({
  title,
  children,
  outline = false,
  onPress,
  onLongPress,
  theme: themeProp = {},
  disabled = false,
  status = 'primary',
}) {
  const theme = useTheme(themeProp);
  const statusColor = useStatusColor({ status, theme });
  console.log('TCL: statusColor', statusColor);
  const color = opacify(statusColor, 0.8);
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      accessible={true}
      disabled={disabled}
      accessibilityRole="button"
    >
      <View
        style={{
          borderRadius: theme.borderRadius,
          borderWidth: 3,
          backgroundColor: outline ? 'transparent' : color,
          borderColor: outline ? color : 'transparent',
          paddingVertical: theme.paddingVertical,
          paddingHorizontal: theme.paddingHorizontal,
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {children}
        {title && (
          <Text
            style={{
              fontSize: theme.buttonFontSize,
              lineHeight: theme.buttonLineHeight,
              color: outline ? color : 'white',
              fontFamily: theme.fontBold,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
