import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from './ThemeContext';
import Container from './Container';
import { BodyText } from './Tokens';
import FeatureSection from './FeatureSection';
import { absoluteElement } from '../components/Styles';

function HowItWorks() {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingTop: 68,
        marginBottom: 100,
      }}
    >
      <Container
        style={{
          alignItems: 'center',
          paddingBottom: 300,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
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
              seeing your neighborhood?
              <BodyText bold>Request us here.</BodyText>
            </BodyText>
          }
          // media={}
        />
        <View style={{ position: 'relative' }}>
          <Image
            source={require('./public/img/mango.png')}
            style={{
              ...absoluteElement,
              width: 520,
              height: 611,
              right: -410,
              top: -270,
              zIndex: 10,
            }}
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
        </View>
        <View style={{ position: 'relative' }}>
          <Image
            source={require('./public/img/mint-spinach.png')}
            style={{
              ...absoluteElement,
              width: 310,
              height: 403,
              left: -250,
              bottom: -250,
              zIndex: 10,
            }}
          />
          <FeatureSection
            title="Pickup"
            bodyText={
              <BodyText>
                Watch as advanced robotics create your perfect blend within 60
                seconds, and when it’s ready, grab it from our pick-up area.
              </BodyText>
            }
            // media={}
          />
        </View>
      </Container>
    </View>
  );
}

export default HowItWorks;
