import React from 'react';
import { View, Text } from 'react-native';
import Container from './Container';
import { Link, Button } from './Buttons';
import OnoBlendsLogo from './OnoBlendsLogo';
import console = require('console');

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
            <Link onPress={() => console.log('Menu Link pressed')}>menu</Link>
            <Link onPress={() => console.log('Schedule Link pressed')}>schedule</Link>
            <Link onPress={() => console.log('Story link pressed')}>our story</Link>
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
