import React from 'react';
import { Image } from 'react-native';
import View from '../views/View';
import { useTheme } from '../dashboard/Theme';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import BodyText from '../dashboard/BodyText';
import FunctionalLink from '../navigation-web/Link';
import { Responsive } from '../dashboard/Responsive';
import FeatureSection from './FeatureSection';
import { absoluteElement } from '../components/Styles';

function FeatureImage({ source, floatingImageStyle }) {
  const theme = useTheme();
  return (
    <Responsive
      style={{
        maxWidth: ['100%', 412],
      }}
    >
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
        <Responsive style={{ height: [288, 372] }}>
          <View
            style={[
              {
                backgroundColor: theme.colors.lightGrey,
                width: '100%',
              },
            ]}
          />
        </Responsive>
      </View>
    </Responsive>
  );
}

function HowItWorks() {
  const theme = useTheme();
  return (
    <Responsive
      style={{
        marginBottom: [60, 100],
      }}
    >
      <View>
        <Container
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
          responsiveStyle={{
            paddingBottom: [48, 200],
          }}
        >
          <Heading
            size="large"
            style={{ textAlign: 'center' }}
            responsiveStyle={{
              marginBottom: [25, 100],
            }}
          >
            How it works
          </Heading>

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
            image={
              <FeatureImage
                floatingImageStyle={{
                  right: [-80, -119],
                  top: [59, -38],
                }}
              />
            }
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
              inverted
              title="Order"
              bodyText={
                <BodyText>
                  Select a blend or personalize oned based on your nutritional
                  preferences or dietary restrictions through our ordering
                  kiosk. Ono Guides are on-site to ensure the best possible
                  experience.
                </BodyText>
              }
              image={
                <FeatureImage
                  floatingImageStyle={{
                    left: [-174, -68],
                    top: [66, 8],
                  }}
                />
              }
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
              style={{ width: '100%' }}
              title="Pickup"
              bodyText={
                <BodyText>
                  Watch as advanced robotics create your perfect blend within 60
                  seconds, and when it’s ready, grab it from our pick-up area.
                </BodyText>
              }
              image={
                <FeatureImage
                  floatingImageStyle={{
                    right: [-185, -48],
                    top: [24, 64],
                  }}
                />
              }
            />
          </View>
        </Container>
      </View>
    </Responsive>
  );
}

export default HowItWorks;
