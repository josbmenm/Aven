import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from './Theme';

export default function Button({
  title,
  children,
  outline = false,
  onPress,
  theme: themeProp = {},
  disabled = false,
}) {
  const theme = useTheme(themeProp);
  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
    >
      <View
        style={{
          borderRadius: 3,
          borderWidth: 3,
          backgroundColor: outline ? 'transparent' : theme.colorPrimary,
          borderColor: theme.colorPrimary,
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
              color: outline ? theme.colorPrimary : 'white',
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
