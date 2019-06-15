import React from 'react';
import { View, Image } from 'react-native';
import GenericPage from '../GenericPage';
import PageFooter from '../PageFooter';
import Container from '../Container';
import MainMenu from '../MainMenu';
import { aspectRatio169 } from '../../components/Styles';
import { Heading, BodyText } from '../Tokens';
import { useTheme } from '../ThemeContext';

function OurStory() {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1, height: '100vh', paddingBottom: 40 }}>
        <MainMenu />
        <View style={{ marginBottom: 220 }}>
          <Container style={{ alignItems: 'center' }}>
            <Image
              source={{
                uri:
                  'https://images.unsplash.com/photo-1494989615690-9900562a5b20?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80',
              }}
              resizeMode="cover"
              style={{ ...aspectRatio169 }}
            />
            <View
              style={{
                position: 'absolute',
                paddingHorizontal: 80,
                paddingVertical: 40,
                backgroundColor: theme.colors.lightGrey,
                bottom: -120,
                width: '100%',
                maxWidth: 640,
                alignSelf: 'center',
              }}
            >
              <Heading>Our Story</Heading>
              <BodyText>
                We started Ono with the idea that healthy, organic, and great
                tasting smoothies should be accessible to everyone. With
                robotics, locally-sourced food, and a bit of luck — Ono Blends
                was born.
              </BodyText>
            </View>
          </Container>
        </View>
      </View>
      <PageFooter />
    </GenericPage>
  );
}

OurStory.navigationOptions = {
  title: 'Our Story',
};

export default OurStory;
