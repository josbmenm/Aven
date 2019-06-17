import React from 'react';
import { View, Text, Image } from 'react-native';
import MainMenu from '../MainMenu';
import Container from '../Container';
import { Button } from '../Buttons';
import {
  Heading,
  BodyText,
  VerticalToHorizontalLayout,
  VerticalToHorizontalLayoutChild,
  NoFlexToFlex,
} from '../Tokens';
import { useTheme } from '../ThemeContext';
import AbsoluteImage from '../AbsoluteImage';

export default function HeroHeader() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, paddingBottom: 60, minHeight: '100vh' }}>
      <MainMenu />
      <NoFlexToFlex>
        <Container>
          <VerticalToHorizontalLayout
            columnReverse
            style={{
              flex: 1,
            }}
          >
            <AbsoluteImage
              source={require('../public/img/strawberry.png')}
              style={{ top: -250, left: -290, width: 482, height: 641 }}
            />
            <AbsoluteImage
              source={require('../public/img/avocado.png')}
              style={{ right: -250, bottom: -290, width: 568, height: 604 }}
            />
            <AbsoluteImage
              source={require('../public/img/fruit_silhouette.png')}
              style={{
                right: -440,
                top: -140,
                width: 521,
                height: 383,
                zIndex: 0,
              }}
            />
            <AbsoluteImage
              source={require('../public/img/fruit_silhouette.png')}
              style={{
                left: -440,
                bottom: -140,
                width: 521,
                height: 383,
                zIndex: 0,
              }}
            />
            <VerticalToHorizontalLayoutChild>
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.lightGrey,
                  justifyContent: 'center',
                  padding: 40,
                  boxSizing: 'border-box',
                }}
              >
                <Heading>
                  We’re making healthy food accessible to everyone.
                </Heading>
                <BodyText
                  style={{
                    marginBottom: 28,
                  }}
                >
                  Using organic fruits and vegetables, we create blends that
                  focus on the best ingredients for you. All of our blends are
                  customizable and designed with your best self in mind.
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
            </VerticalToHorizontalLayoutChild>
            <VerticalToHorizontalLayoutChild>
              <Image
                source={require('./assets/home_hero-image.jpg')}
                resizeMode="cover"
                style={{ flex: 1, width: '100%', paddingTop: '56.25%' }}
              />
            </VerticalToHorizontalLayoutChild>
          </VerticalToHorizontalLayout>
        </Container>
      </NoFlexToFlex>
    </View>
  );
}
