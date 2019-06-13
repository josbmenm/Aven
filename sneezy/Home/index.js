import React, { Fragment } from 'react';
import { View, Text } from 'react-native';
import GenericPage from '../GenericPage';
import HeroHeader from './HeroHeader';
import { ThemeContext, theme as defaultTheme, useTheme } from '../ThemeContext';
import FullViewportImage from '../FullViewportImage';
import Container from '../Container';
import PageFooter from '../PageFooter';

function Home() {
  const theme = useTheme();
  return (
    <React.Fragment>
      <HeroHeader />
      {/* Image Full viewport Section */}
      <FullViewportImage
        source={{
          uri:
            'https://images.unsplash.com/photo-1494989615690-9900562a5b20?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80',
        }}
      />

      <View>
        <Container
          style={{
            flex: 1,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 40,
              paddingVertical: 120,
              maxWidth: 720,
            }}
          >
            <Text
              style={{
                fontSize: 38,
                fontWeight: 'bold',
                lineHeight: 48,
                fontFamily: theme.fonts.MaaxBold,
                marginBottom: 8,
                textAlign: 'center',
                color: theme.colors.primary,
              }}
            >
              We believe that good food  brings out the best in you.
            </Text>
            <Text
              style={{
                fontSize: 18,
                lineHeight: 28,
                textAlign: 'center',
                fontFamily: theme.fonts.Lora,
                color: theme.colors.primary,
                marginBottom: 38,
              }}
            >
              We believe affordable nutrition should be accessible to everyone.
              With advanced robotics, thoughtful food sourcing, and nutritious
              ingredients we’re able to deliver this promise.
            </Text>
          </View>
        </Container>
      </View>
      <PageFooter />
    </React.Fragment>
  );
}

function HomePage() {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      <GenericPage>
        <Home />
      </GenericPage>
    </ThemeContext.Provider>
  );
}

HomePage.navigationOptions = {
  title: 'Home',
};

export default HomePage;
