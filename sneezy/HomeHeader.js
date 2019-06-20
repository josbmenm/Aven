import React from 'react';
import { View, Image } from 'react-native';
import Container from './Container';
import { Button, Heading, BodyText } from './Tokens';
import {
  ColumnToRow,
  ColumnToRowChild,
  NoFlexToFlex,
  Responsive,
  HideMobileView,
  HideDesktopView,
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
              <HideMobileView>
                <Image
                  source={require('./public/img/fruit_silhouette.png')}
                  style={{
                    ...absoluteElement,
                    zIndex: 0,
                  }}
                />
              </HideMobileView>
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
                  <BodyText
                    style={{
                      marginBottom: 28,
                    }}
                  >
                    Using organic fruits and vegetables, we create blends that
                    focus on the best ingredients for you. All of our blends are
                    customizable and designed with your best self in mind.
                  </BodyText>
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
            <HideMobileView
              style={{
                ...absoluteElement,
                width: 482,
                height: 641,
                top: -250,
                left: -290,
              }}
            >
              <Image
                source={require('./public/img/strawberry.png')}
                style={{
                  ...absoluteElement,
                  width: 482,
                  height: 641,
                }}
              />
            </HideMobileView>
            <HideDesktopView
              style={{
                ...absoluteElement,
                width: 241,
                height: 320,
                bottom: -250,
                left: -290,
              }}
            >
              <Image
                className="IMAGEE"
                source={require('./public/img/strawberry.png')}
                style={{
                  ...absoluteElement,
                  width: 241,
                  height: 320,
                }}
              />
            </HideDesktopView>
            <Responsive
              style={{
                right: [0, -250],
                bottom: [0, -290],
              }}
            >
              <Image
                source={require('./public/img/avocado.png')}
                style={{
                  ...absoluteElement,
                  width: 568,
                  height: 604,
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
