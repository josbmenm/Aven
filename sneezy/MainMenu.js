import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import { Link, Button, defaultButtonStyles } from './Buttons';
import OnoBlendsLogo from './OnoBlendsLogo';

export function MenuLink({
  buttonStyle = {},
  textStyle = {},
  active = false,
  text,
  onPress,
  ...rest
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          ...defaultButtonStyles.button,
          borderBottomWidth: 3,
          borderColor: active ? colors.primary : "transparent",
          ...buttonStyle
        }}
      >
        <Text
          style={{
            ...defaultButtonStyles.text,
            color: colors.primary,
            ...textStyle
          }}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}


export default function MainMenu() {
  return (
    <View
      style={{
        paddingVertical: 38,
      }}
    >
      <Container>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}
        >
          {/* Logo */}
          <OnoBlendsLogo />

          {/* Menu Items */}
          <View
            style={{
              alignItems: 'flex-end',
              flexDirection: 'row',
            }}
          >
            <MenuLink text="menu" onPress={() => console.log('Menu Link pressed')}></MenuLink>
            <MenuLink text="schedule" onPress={() => console.log('Schedule Link pressed')}></MenuLink>
            <MenuLink text="our story" onPress={() => console.log('Story link pressed')}></MenuLink>
            <Button
              onPress={() => console.log('Book with us pressed')}
              type="outline"
              text="book with us"
              textStyle={{ fontSize: 20 }}
            />
          </View>
        </View>
      </Container>
    </View>
  );
}
