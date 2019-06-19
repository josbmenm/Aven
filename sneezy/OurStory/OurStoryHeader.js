import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Container from '../Container';
import MainMenu from '../MainMenu';
import { aspectRatio169 } from '../../components/Styles';
import { Heading, BodyText } from '../Tokens';
import { useTheme } from '../ThemeContext';

function OurStoryHeader({ breakpoint, style, ...rest }) {
  const theme = useTheme();
  const bp = breakpoint || theme.breakpoints[0];
  return (
    <View style={StyleSheet.flatten([{ flex: 1, minHeight: '100vh', paddingBottom: 40 }, style])}>
      <style dangerouslySetInnerHTML={{__html: `
        @media only screen and (min-width: ${bp}px) {
          .ourstory-header-content {
            position: absolute;
            bottom: -120px;
            align-self: center;
            max-width: 640px;
          }
        }
      `}} />
      <MainMenu />
      {/* responsive: change margin bottom */}
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
            className="ourstory-header-content"
            style={{
              paddingHorizontal: 80,
              paddingVertical: 40,
              backgroundColor: theme.colors.lightGrey,
              width: '100%',
            }}
          >
            <Heading>Our Story</Heading>
            <BodyText>
              We started Ono with the idea that healthy, organic, and great
              tasting smoothies should be accessible to everyone. With robotics,
              locally-sourced food, and a bit of luck — Ono Blends was born.
            </BodyText>
          </View>
        </Container>
      </View>
    </View>
  );
}

export default OurStoryHeader;
