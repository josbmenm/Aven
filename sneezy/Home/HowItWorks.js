import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import Container from '../Container';
import { BodyText, Title } from '../Tokens';

function FeatureSection({ title, bodyText, media, inverted = false }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: inverted ? 'row-reverse' : 'row',
        width: '90%',
      }}
    >
      <View style={{ flex: 1, flexBasis: 0, flexDirection: 'row', justifyContent: inverted ? 'flex-end' : 'flex-start' }}>
        {/* IMAGE HERE */}
        <View
          style={{
            width: 412,
            height: 372,
            backgroundColor: theme.colors.lightGrey,
          }}
        />
      </View>
      <View style={{ flex: 1, flexBasis: 0, justifyContent: 'center' }}>
        <Title>{title}</Title>
        {bodyText}
      </View>
    </View>
  );
}

function HowItWorks() {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingTop: 68,
        marginBottom: 200
      }}
    >
      <Container
        style={{
          alignItems: 'center',
        }}
      >
        <Text style={{ ...theme.textStyles.heading, marginBottom: 100 }}>
          How it works
        </Text>
        <FeatureSection
          title="Find us"
          bodyText={
            <BodyText>
              Check out the <BodyText bold>schedule</BodyText> to find us. Not
              seeing your neighborhood?{' '}
              <BodyText bold>Request us here.</BodyText>
            </BodyText>
          }
          // media={}
        />
        <FeatureSection
          title="Order"
          bodyText={
            <BodyText>
              Select a blend or personalize oned based on your nutritional
              preferences or dietary restrictions through our ordering kiosk.
              Ono Guides are on-site to ensure the best possible experience.
            </BodyText>
          }
          // media={}
          inverted
        />
        <FeatureSection
          title="Pickup"
          bodyText={
            <BodyText>
              Watch as advanced robotics create your perfect blend within 60 seconds, and when it’s ready, grab it from our pick-up area.
            </BodyText>
          }
          // media={}
        />
      </Container>
    </View>
  );
}

export default HowItWorks;
