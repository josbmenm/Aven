import React from 'react';
import { View, Text, Image } from 'react-native';
import MainMenu from '../MainMenu';
import Container from '../Container';
import { Button } from '../Buttons';
import { Heading, BodyText } from '../Tokens';
import { useTheme } from '../ThemeContext';

function HeaderContent() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, flexBasis: 0 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.lightGrey,
          // height: '100%',
          justifyContent: 'center',
          padding: 24,
          paddingLeft: 108,
          boxSizing: 'border-box',
        }}
      >
        <Heading>We’re making healthy food accessible to everyone.</Heading>
        <BodyText
          style={{
            marginBottom: 28,
          }}
        >
          Using organic fruits and vegetables, we create blends that focus on
          the best ingredients for you. All of our blends are customizable and
          designed with your best self in mind.
        </BodyText>
        <Button
          text="Find us"
          routeName="FindUs"
          buttonStyle={{
            width: 210,
          }}
          textStyle={{
            textAlign: 'center',
          }}
        />
      </View>
    </View>
  );
}

export default function HeroHeader() {
  return (
    <View style={{ flex: 1, height: '100vh', paddingBottom: 40, backgroundColor: 'red' }}>
      <MainMenu />
      <Container
        style={{
          flex: 1,
          flexDirection: 'column',
          // alignItems: 'stretch',
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'stretch',
          }}
        >
          <HeaderContent />
          <View style={{ flex: 1, flexBasis: 0 }}>
            <Image
              source={require('./assets/home_hero-image.jpg')}
              resizeMode="cover"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Container>
    </View>
  );
}
