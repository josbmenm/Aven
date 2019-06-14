import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import { Button } from './Buttons';
import OnoBlendsLogo from './OnoBlendsLogo';
import Link from '../navigation-web/Link';

export function MenuLink({
  text,
  buttonStyle,
  textStyle,
  active,
  routeName,
  ...rest
}) {
  const theme = useTheme();
  return (
    <Button
      text={text}
      type="outline"
      routeName={routeName}
      buttonStyle={{
        borderRadius: 0,
        borderWidth: 0,
        borderColor: 'transparent',
        borderBottomWidth: 3,
        borderBottomColor: active ? theme.colors.primary : 'transparent',
        ...buttonStyle,
      }}
      textStyle={textStyle}
      {...rest}
    />
  );
}

export default function MainMenu() {
  return (
    <View
      style={{
        paddingVertical: 40,
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
          <Link routeName="Home" renderContent={() => <OnoBlendsLogo />} />

          {/* Menu Items */}
          <View
            style={{
              alignItems: 'flex-end',
              flexDirection: 'row',
            }}
          >
            <MenuLink routeName="Menu" text="menu" />
            <MenuLink routeName="Schedule" text="schedule" />
            <MenuLink routeName="OurStory" text="our story" />
            <Button
              type="outline"
              text="book with us"
              routeName="Book"
              // textStyle={{ fontSize: 20 }}
              buttonStyle={{ marginLeft: 16 }}
            />
          </View>
        </View>
      </Container>
    </View>
  );
}
