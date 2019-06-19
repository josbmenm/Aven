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
import { useTheme } from './ThemeContext';
import AbsoluteImage from './AbsoluteImage';

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
            <AbsoluteImage
              source={require('./public/img/fruit_silhouette.png')}
              style={{
                right: -440,
                top: -140,
                width: 521,
                height: 383,
                zIndex: 0,
              }}
            />
            <AbsoluteImage
              source={require('./public/img/fruit_silhouette.png')}
              style={{
                left: -440,
                bottom: -140,
                width: 521,
                height: 383,
                zIndex: 0,
              }}
            />
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
            <AbsoluteImage
              source={require('./public/img/strawberry.png')}
              style={{ top: -250, left: -290, width: 482, height: 641 }}
            />
            <AbsoluteImage
              source={require('./public/img/avocado.png')}
              style={{ right: -250, bottom: -290, width: 568, height: 604 }}
            />
          </ColumnToRow>
        </Container>
      </NoFlexToFlex>
    </View>
  );
}

export default HomeHeader;
