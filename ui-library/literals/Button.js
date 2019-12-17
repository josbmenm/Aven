import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '../Theme';

export default function Button({
  title,

  outline = false,
  onPress,
  theme: themeProp = {},
  disabled = false,
}) {
  const theme = useTheme(themeProp);
  console.log('TCL: title', title);
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
        <Text
          style={{
            fontSize: theme.fontSize,
            lineHeight: theme.lineHeight,
            color: outline ? theme.colorPrimary : 'white',
            fontFamily: theme.fontBold,
            fontWeight: 'bold',
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
