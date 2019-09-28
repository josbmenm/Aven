import React from 'react';
import { Image } from 'react-native';
import View from '../views/View';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import BodyText from '../dashboard/BodyText';
import FunctionalLink from '../navigation-web/Link';
import { Responsive } from '../dashboard/Responsive';
import FeatureSection from './FeatureSection';
import { absoluteElement } from '../components/Styles';

function FeatureImage({ source, floatingImageStyle }) {
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
          <Image
            source={source}
            style={{
              flex: 1,
              alignSelf: 'stretch',
            }}
          />
        </Responsive>
      </View>
    </Responsive>
  );
}

function BodyLink({ children, ...props }) {
  return (
    <FunctionalLink {...props}>
      <BodyText bold>{children}</BodyText>
    </FunctionalLink>
  );
}

function HowItWorks() {
  return (
    <Responsive
      style={{
        marginBottom: [60, 100],
      }}
    >
      <View>
        <Container
          style={{
            zIndex: 12,
            //  todo: re-enable this when the schedule section is enabled
            // borderBottomWidth: 1,
            // borderBottomColor: theme.colors.border,
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
            responsiveStyles={{
              paddingLeft: [0, 120],
              paddingBottom: [100, 0],
            }}
            title="Find Us"
            bodyText={
              <BodyText>
                We will release our schedule soon. To be the first to know where
                we are,{' '}
                <BodyLink routeName="Subscribe">subscribe here.</BodyLink>
              </BodyText>
              // <BodyText>
              //   Check out the{' '}
              //   <FunctionalLink routeName="Schedule">
              //     <BodyText bold>schedule</BodyText>{' '}
              //   </FunctionalLink>
              //   to find us. Not seeing your neighborhood?{' '}
              //   <FunctionalLink routeName="Schedule">
              //     <BodyText bold>Request us here.</BodyText>
              //   </FunctionalLink>
              // </BodyText>
            }
            image={
              <FeatureImage
                floatingImageStyle={{
                  right: [-80, -119],
                  top: [59, -38],
                }}
                source={require('./public/img/FindUs.png')}
              />
            }
          />

          <View style={{ position: 'relative', zIndex: 1 }}>
            <Image
              source={require('./public/img/mango.png')}
              pointerEvents="none"
              style={{
                ...absoluteElement,
                width: 520,
                height: 611,
                right: -410,
                top: -270,
                zIndex: 1,
              }}
            />

            <FeatureSection
              inverted
              responsiveStyles={{
                paddingRight: [0, 120],
                paddingBottom: [80, 0],
              }}
              title="Order"
              bodyText={
                <BodyText>
                  Select a blend or personalize one based on your nutritional
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
                  source={require('./public/img/KioskOrder.png')}
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
              responsiveStyles={{
                paddingLeft: [0, 120],
              }}
              title="Pick Up"
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
                  source={require('./public/img/PickUp.png')}
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
