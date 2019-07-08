import React from 'react';
import { StyleSheet, Image } from 'react-native';
import View from '../views/View';
import GenericPage from './GenericPage';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import BodyText from '../dashboard/BodyText';
import { useTheme } from '../dashboard/Theme';
import FeatureSection from './FeatureSection';
import TheTeam from './TheTeam';
import PageFooter from './PageFooter';
import {
  aspectRatio169,
  aspectRatio43,
  absoluteElement,
} from '../components/Styles';
import { Responsive } from '../dashboard/Responsive';

function FeatureImage({ source, floatingImageStyle }) {
  // const theme = useTheme();
  return (
    <View
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Responsive
        style={{
          width: [239, 335],
          height: [176, 246],
          ...floatingImageStyle,
        }}
      >
        <Image
          source={require('./public/img/fruit_silhouette.png')}
          style={{
            ...absoluteElement,
            zIndex: 0,
          }}
        />
      </Responsive>
      {/* FEATURE IMAGE HERE */}
      {/* TODO: aspect ratio image? */}
      <Image source={source} style={{ ...aspectRatio43 }} />
    </View>
  );
}

function OurStoryPage({}) {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1 }}>
        <View>
          <Container
            style={{ alignItems: 'center' }}
            responsiveStyle={{
              width: ['100% !important', '100%'],
              marginHoriontal: [0, 28],
              marginBottom: [80, 0],
            }}
          >
            <Responsive
              style={{
                marginHorizontal: [28, 0],
                marginBottom: [12, 0],
                width: ['calc(100% - 56px)', '100%'],
              }}
            >
              <View style={{ flex: 1 }}>
                <Image
                  source={{
                    uri:
                      'https://images.unsplash.com/photo-1494989615690-9900562a5b20?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80',
                  }}
                  resizeMode="cover"
                  style={{ ...aspectRatio169 }}
                />
              </View>
            </Responsive>
            <Responsive
              style={{
                position: ['relative', 'absolute'],
                bottom: [0, 120],
                alignSelf: ['inherit', 'center'],
                maxWidth: [1200, 640],
              }}
            >
              <View
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
                  tasting smoothies should be accessible to everyone. With
                  robotics, locally-sourced food, and a bit of luck - Ono Blends
                  was born.
                </BodyText>
              </View>
            </Responsive>
          </Container>
        </View>
      </View>
      <Responsive
        style={{
          marginBottom: [40, 80],
        }}
      >
        <View>
          <Container
            style={{
              borderBottomColor: theme.colors.border,
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          >
            <FeatureSection
              title="Real food. Real good. Real fast."
              style={{ marginBottom: 80 }}
              responsiveStyles={{ textAlign: ['center', 'left'] }}
              bodyText={
                <BodyText>
                  Ono, a local Hawaiian term for “delicious” is exactly what our
                  smoothies are. With flavors like avocado & matcha, strawberry
                  & dragonfruit, and mint chip greens - our blends are crafted
                  by hand and perfected with technology.
                </BodyText>
              }
              image={
                <FeatureImage
                  source={require('./public/img/ourstory-feature.jpg')}
                  floatingImageStyle={{
                    top: [-80, -18],
                    right: [400, -72],
                  }}
                />
              }
            />
            <FeatureSection
              inverted
              title="Powered by robotics"
              style={{ marginBottom: 80 }}
              bodyText={
                <BodyText>
                  Automation gives us the ability to ensure your order is
                  blended to perfection. While the robots do the work, we’re
                  able to spend more time with you, our customer.
                </BodyText>
              }
              image={
                <FeatureImage
                  source={require('./public/img/ourstory-feature.jpg')}
                  floatingImageStyle={{
                    top: [0, 28],
                    left: [0, -96],
                    display: ['none', 'block'],
                  }}
                />
              }
            />
            <FeatureSection
              title="Blends with benefits"
              style={{ marginBottom: 80 }}
              bodyText={
                <BodyText>
                  Healthy, organic, and great tasting smoothies don’t have to be
                  over priced. We believe that nutritious food should be
                  accessible to everyone. With customization we’re able to fuel
                  you through an early morning meeting or a post-workout
                  recovery — each blend is created specifically with you in
                  mind.
                </BodyText>
              }
              image={
                <FeatureImage
                  source={require('./public/img/ourstory-feature.jpg')}
                  floatingImageStyle={{
                    top: [0, 28],
                    right: [0, -100],
                    display: ['none', 'block'],
                  }}
                />
              }
            />
          </Container>
        </View>
      </Responsive>
      <TheTeam />
      <PageFooter />
    </GenericPage>
  );
}

OurStoryPage.navigationOptions = {
  title: 'Our Story',
};

export default OurStoryPage;
