import React from 'react';
import { View, Image } from 'react-native';
import { useTheme } from './ThemeContext';
import Container from './Container';
import { BodyText, Heading } from './Tokens';
import FunctionalLink from '../navigation-web/Link';
import { Responsive } from './Responsive';
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
          borderBottomWidth: 1,
          paddingBottom: 200,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Heading style={{ marginBottom: 100 }}>How it works</Heading>
        <FeatureSection
          title="Find us"
          bodyText={
            <BodyText>
              Check out the{' '}
              <FunctionalLink routeName="Schedule">
                <BodyText bold>schedule</BodyText>{' '}
              </FunctionalLink>
              to find us. Not seeing your neighborhood?{' '}
              <FunctionalLink routeName="Schedule">
                <BodyText bold>Request us here.</BodyText>
              </FunctionalLink>
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
          <Responsive
            style={{
              bottom: [140, -250],
            }}
          >
            <Image
              source={require('./public/img/mint-spinach.png')}
              style={{
                ...absoluteElement,
                width: 310,
                height: 403,
                left: -250,
                zIndex: 10,
              }}
            />
          </Responsive>
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
