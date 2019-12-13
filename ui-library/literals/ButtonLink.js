import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '../Theme';

export default function ButtonLink({
  title,
  active = false,
  to,
  theme: themeProp = {},
  disabled = false,
  target,
}) {
  const theme = useTheme(themeProp);

  function handlePress() {
    console.log(`Link clicked => go to: ${to}`);
  }

  return (
    <TouchableOpacity onPress={handlePress} accessible={true}>
      <View
        style={{
          borderWidth: 0,
          borderColor: theme.colorPrimary,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
          paddingVertical: theme.paddingVertical,
          borderBottomColor: active ? theme.colorPrimary : 'transparent',
          borderBottomWidth: 3,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize,
            lineHeight: theme.lineHeight,
            color: theme.colorPrimary,
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
