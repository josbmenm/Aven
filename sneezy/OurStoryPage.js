import React from 'react';
import { StyleSheet, Image } from 'react-native';
import View from '../views/View';
import GenericPage from './GenericPage';
import Container from './Container';
import Heading from './Heading';
import BodyText from './BodyText';
import { useTheme } from '../dashboard/Theme';
import FeatureSection from './FeatureSection';
import TheTeam from './TheTeam';
import PageFooter from './PageFooter';
import { aspectRatio169, aspectRatio43 } from '../components/Styles';
import { Responsive } from '../dashboard/Responsive';

function OurStoryPage({}) {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1 }}>
        <View>
          <Responsive
            style={{
              width: ['100% !important', '100%'],
              marginHoriontal: [0, 28],
              marginBottom: [80, 0]
            }}
          >
            <Container style={{ alignItems: 'center' }}>
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
                    We started Ono with the idea that healthy, organic, and
                    great tasting smoothies should be accessible to everyone.
                    With robotics, locally-sourced food, and a bit of luck - Ono
                    Blends was born.
                  </BodyText>
                </View>
              </Responsive>
            </Container>
          </Responsive>
        </View>
      </View>
      <View>
        <Container
          style={{
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
                dragonfruit, and mint chip greens - our blends are crafted by
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
            title="Powered by robotics"
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
      <TheTeam />
      <PageFooter />
    </GenericPage>
  );
}

OurStoryPage.navigationOptions = {
  title: 'Our Story',
};

export default OurStoryPage;
