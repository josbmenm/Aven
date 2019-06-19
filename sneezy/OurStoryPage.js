import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import GenericPage from './GenericPage';
import Container from './Container';
import { BodyText, Heading } from './Tokens';
import { useTheme } from './ThemeContext';
import FeatureSection from './FeatureSection';
import PageFooter from './PageFooter';
import { aspectRatio169, aspectRatio43 } from '../components/Styles';


function OurStoryPage({ }) {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1, minHeight: '100vh', paddingBottom: 40 }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media only screen and (min-width: ${theme.breakpoints[0]}px) {
          .ourstory-header-content {
            position: absolute;
            bottom: -120px;
            align-self: center;
            max-width: 640px;
          }
        }
      `}} />
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
      <View>
        <Container
          style={{
            marginBottom: 80,
            paddingBottom: 100,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        >
          <FeatureSection
            title="Real food. Real good. Real fast."
            bodyText={
              <BodyText>
                Ono, a local Hawaiian term for “delicious” is exactly what our
                smoothies are. With flavors like avocado & matcha, strawberry &
                dragonfruit, and mint chip greens — our blends are crafted by
                hand and perfected with technology.
              </BodyText>
            }
            image={
              <Image
                source={require('./public/img/ourstory-feature.jpg')}
                style={{ maxWidth: 630, ...aspectRatio43 }}
              />
            }
          />
          <FeatureSection
            inverted
            title="Powered by Robotics"
            bodyText={
              <BodyText>
                Automation gives us the ability to ensure your order is blended
                to perfection. While the robots do the work, we’re able to spend
                more time with you, our customer.
              </BodyText>
            }
            image={
              <Image
                source={require('./public/img/ourstory-feature.jpg')}
                style={{ maxWidth: 630, ...aspectRatio43 }}
              />
            }
          />
          <FeatureSection
            title="Blends with benefits"
            bodyText={
              <BodyText>
                Healthy, organic, and great tasting smoothies don’t have to be
                over priced. We believe that nutritious food should be
                accessible to everyone. With customization we’re able to fuel
                you through an early morning meeting or a post-workout recovery
                — each blend is created specifically with you in mind.
              </BodyText>
            }
            image={
              <Image
                source={require('./public/img/ourstory-feature.jpg')}
                style={{ maxWidth: 630, ...aspectRatio43 }}
              />
            }
          />
        </Container>
      </View>
      <View>
        <Container
          style={{
            marginBottom: 80,
          }}
        >
          <FeatureSection
            title="The team"
            bodyText={
              <BodyText>
                We’re a team of foragers, foodies and builders with backgrounds
                in robotics, automation, logistics, and culinary fine dining.
                Regardless of the discipline, design and hospitality are at the
                core of everything we do.
              </BodyText>
            }
            image={
              <Image
                source={require('./public/img/ourstory-feature.jpg')}
                style={{ maxWidth: 430, ...aspectRatio43 }}
              />
            }
          />
        </Container>
      </View>
      <PageFooter />
    </GenericPage>
  );
}

OurStoryPage.navigationOptions = {
  title: 'Our Story',
};

export default OurStoryPage;
