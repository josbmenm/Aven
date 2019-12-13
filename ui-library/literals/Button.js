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

  const buttonStyles = {
    borderRadius: 3,
    borderWidth: 3,
    backgroundColor: outline ? 'transparent' : theme.colorPrimary,
    borderColor: outline ? theme.colorPrimary : 'transparent',
    paddingVertical: theme.paddingVertical,
    paddingHorizontal: theme.paddingHorizontal,
    alignItems: 'center',
    opacity: disabled ? 0.5 : 1,
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
    >
      <View style={buttonStyles}>
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
