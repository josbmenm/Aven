import React from 'react';
import { View, StyleSheet } from 'react-native';
import GenericPage from '../GenericPage';
import PageFooter from '../PageFooter';
import Container from '../Container';
import { BodyText } from '../Tokens';
import { useTheme } from '../ThemeContext';
import Header from './OurStoryHeader';
import FeatureSection from '../FeatureSection';
import { aspectRatio169 } from '../../components/Styles';

function OurStory() {
  const theme = useTheme();
  return (
    <GenericPage>
      <Header />
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
            // media={}
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
              // media={}
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
              // media={}
            }
          />
        </Container>
      </View>
      <View>
        <Container style={{
          marginBottom: 80
        }}>
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
          />
        </Container>
      </View>
      <PageFooter />
    </GenericPage>
  );
}

OurStory.navigationOptions = {
  title: 'Our Story',
};

export default OurStory;
