import React from 'react';
import { Image } from 'react-native';
import View from '../views/View';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import BodyText from '../dashboard/BodyText';
import ButtonLink from './ButtonLink';
import { ColumnToRow, ColumnToRowChild, NoFlexToFlex } from './Responsive';
import { Responsive } from '../dashboard/Responsive';
import { absoluteElement } from '../components/Styles';
import { useTheme } from '../dashboard/Theme';

const breakpoints = [1024, 1400];

function HomeHeader() {
  const theme = useTheme();
  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        marginBottom: [132, 180],
      }}
    >
      <View style={{ flex: 1 }}>
        <NoFlexToFlex>
          <Container
            style={{ flex: 1 }}
            responsiveStyle={{
              width: ['100% !important', '100%'],
              marginHoriontal: [0, 28],
            }}
          >
            <ColumnToRow
              columnReverse
              breakpoints={breakpoints}
              style={{
                flex: 1,
              }}
            >
              <Responsive
                breakpoints={breakpoints}
                style={{
                  left: [0, -440],
                  bottom: [0, -140],
                }}
              >
                <Image
                  className="hide-mobile"
                  source={require('./public/img/fruit_silhouette.png')}
                  style={{
                    ...absoluteElement,
                    zIndex: 0,
                    width: 521,
                    height: 383,
                  }}
                />
              </Responsive>
              <Responsive
                breakpoints={breakpoints}
                style={{
                  right: [-440, -440],
                  top: [-156, -140],
                }}
              >
                <Image
                  source={require('./public/img/fruit_silhouette.png')}
                  style={{
                    ...absoluteElement,
                    width: 521,
                    height: 383,
                    zIndex: 0,
                  }}
                />
              </Responsive>
              <ColumnToRowChild>
                <Responsive
                  breakpoints={breakpoints}
                  style={{
                    paddingTop: [40, 240],
                    paddingRight: [20, 20],
                    paddingBottom: [40, 200],
                    paddingLeft: [20, 100],
                    alignItems: ['center', 'flex-start'],
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.lightGrey,
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                    }}
                  >
                    <Heading
                      variant="large"
                      breakpoints={breakpoints}
                      responsiveStyle={{
                        marginBottom: [16, 6],
                        textAlign: ['center', 'left'],
                      }}
                    >
                      We’re making healthy food accessible to everyone.
                    </Heading>
                    <BodyText
                      responsiveStyle={{
                        marginBottom: [20, 45],
                      }}
                    >
                      Using organic fruits and vegetables, we create blends that
                      focus on the best ingredients for you. All of our blends
                      are customizable and designed with your best self in mind.
                    </BodyText>
                    <ButtonLink
                      title="find us"
                      routeName="Schedule"
                      buttonStyle={{
                        width: 210,
                      }}
                      titleStyle={{
                        textAlign: 'center',
                      }}
                    />
                  </View>
                </Responsive>
              </ColumnToRowChild>
              <ColumnToRowChild>
                <Responsive
                  breakpoints={breakpoints}
                  style={{
                    marginHorizontal: [28, 0],
                    marginBottom: [12, 0],
                    width: ['auto', '100%'],
                  }}
                >
                  <View style={{ width: '100%', flex: 1 }}>
                    <Image
                      source={require('./public/img/home_hero-image.jpg')}
                      resizeMode="cover"
                      style={{ flex: 1, width: '100%', paddingTop: '56.25%' }}
                    />
                  </View>
                </Responsive>
              </ColumnToRowChild>
              <Responsive
                breakpoints={breakpoints}
                style={{ display: ['none', 'block'] }}
              >
                <Image
                  source={require('./public/img/strawberry.png')}
                  style={{
                    ...absoluteElement,
                    width: 482,
                    height: 641,
                    top: -250,
                    left: -290,
                  }}
                />
              </Responsive>
              <Responsive
                breakpoints={breakpoints}
                style={{ display: ['block', 'none'] }}
              >
                <Image
                  className="hide-desktop"
                  source={require('./public/img/strawberry.png')}
                  style={{
                    ...absoluteElement,
                    width: 241,
                    height: 320,
                    bottom: -172,
                    left: -100,
                  }}
                />
              </Responsive>
              <Responsive
                breakpoints={breakpoints}
                style={{
                  right: [-125, -250],
                  bottom: [-140, -290],
                  width: [284, 568],
                  height: [302, 604],
                }}
              >
                <Image
                  source={require('./public/img/avocado.png')}
                  style={{
                    ...absoluteElement,
                  }}
                />
              </Responsive>
            </ColumnToRow>
          </Container>
        </NoFlexToFlex>
      </View>
    </Responsive>
  );
}

export default HomeHeader;
