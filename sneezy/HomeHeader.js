import React from 'react';
import { View, Image } from 'react-native';
import Container from './Container';
import { Button, Heading, BodyText } from './Tokens';
import {
  ColumnToRow,
  ColumnToRowChild,
  NoFlexToFlex,
  Responsive,
} from './Responsive';
import { absoluteElement } from '../components/Styles';
import { useTheme } from './ThemeContext';

function HomeHeader() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, paddingBottom: 60 }}>
      <NoFlexToFlex>
        <Container style={{ flex: 1 }}>
          <ColumnToRow
            columnReverse
            style={{
              flex: 1,
            }}
          >
            <Responsive
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
              style={{
                right: [-440, -440],
                top: [-240, -140],
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
                  <Heading>
                    We’re making healthy food accessible to everyone.
                  </Heading>
                  <Responsive
                    style={{
                      textAlign: ['center', 'left'],
                    }}
                  >
                    <BodyText
                      style={{
                        marginBottom: 28,
                      }}
                    >
                      Using organic fruits and vegetables, we create blends that
                      focus on the best ingredients for you. All of our blends
                      are customizable and designed with your best self in mind.
                    </BodyText>
                  </Responsive>
                  <Button
                    text="Find us"
                    routeName="Schedule"
                    buttonStyle={{
                      width: 210,
                    }}
                    textStyle={{
                      textAlign: 'center',
                    }}
                  />
                </View>
              </Responsive>
            </ColumnToRowChild>
            <ColumnToRowChild>
              <Image
                source={require('./public/img/home_hero-image.jpg')}
                resizeMode="cover"
                style={{ flex: 1, width: '100%', paddingTop: '56.25%' }}
              />
            </ColumnToRowChild>
            <Image
              className="hide-mobile"
              source={require('./public/img/strawberry.png')}
              style={{
                ...absoluteElement,
                width: 482,
                height: 641,
                top: -250,
                left: -290,
              }}
            />

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
            <Responsive
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
  );
}

export default HomeHeader;
