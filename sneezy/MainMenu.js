import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import { Button, defaultButtonStyles } from './Buttons';
import OnoBlendsLogo from './OnoBlendsLogo';

export function MenuLink({text, onPress, buttonStyle, textStyle, active, ...rest}) {
  const theme = useTheme();
  return (
    <Button
      onPress={onPress}
      text={text}
      type="outline"
      buttonStyle={{
        borderRadius: 0,
        borderWidth: 0,
        borderColor: 'transparent',
        borderBottomWidth: 3,
        borderBottomColor: active ? theme.colors.primary : "transparent",
        ...buttonStyle,
      }}
      {...rest}
    />
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
            <MenuLink
              text="menu"
              onPress={() => console.log('Menu Link pressed')}
            />
            <MenuLink
              text="schedule"
              onPress={() => console.log('Schedule Link pressed')}
            />
            <MenuLink
              text="our story"
              onPress={() => console.log('Story link pressed')}
            />
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
