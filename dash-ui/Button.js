import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from './Theme';
import { opacify } from './utils';

export default function Button({
  title,
  children,
  outline = false,
  onPress,
  onLongPress,
  theme: themeProp = {},
  disabled = false,
}) {
  const theme = useTheme(themeProp);
  const color = opacify(theme.colorPrimary, 0.8);
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
          borderRadius: 3,
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
            }}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
