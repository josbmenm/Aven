import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from './Theme';
import { useStatusColor, opacify } from './utils';

export default function ButtonLink({
  title,
  active = false,
  to,
  theme: themeProp = {},
  disabled = false,
  status = 'primary',
  target,
}) {
  const theme = useTheme(themeProp);
  const color = opacify(useStatusColor({ status, theme }), 0.8);
  function handlePress() {
    console.log(`Link clicked => go to: ${to}`);
  }

  return (
    <TouchableOpacity onPress={handlePress} accessible={true}>
      <View
        style={{
          borderWidth: 0,
          borderColor: color,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
          paddingVertical: theme.paddingVertical,
          borderBottomColor: active ? color : 'transparent',
          borderBottomWidth: 3,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize,
            lineHeight: theme.lineHeight,
            color: color,
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
