import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import { useTheme } from '../dashboard/Theme';
import {
  NoFlexToFlex,
  ColumnToRow,
  ColumnToRowChild,
  Responsive,
} from './Responsive';
import Container from './Container';
import { Title } from './Tokens';
import Heading from './Heading';
import BodyText from './BodyText';
import Schedule from './Schedule';

function SchedulePage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <View
        style={{
          marginVertical: 40,
        }}
      >
        <NoFlexToFlex>
          <Container style={{ flex: 1 }}>
            <ColumnToRow
              columnReverse
              style={{
                flex: 1,
              }}
            >
              <ColumnToRowChild>
                <Responsive
                  style={{
                    paddingLeft: [28, 100],
                    paddingVertical: [40, 100],
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      paddingRight: 28,
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      backgroundColor: theme.colors.lightGrey,
                    }}
                  >
                    <Responsive
                      style={{
                        textAlign: ['center', 'left'],
                      }}
                    >
                      <Title>Where are we today?</Title>
                      <BodyText>
                        Ono Blends is based in LA, but we’re always on the move.
                        If you’d like to see us in your city, please{' '}
                        <BodyText bold>request a new city</BodyText> and we’ll
                        try to make it happen!
                      </BodyText>
                    </Responsive>
                  </View>
                </Responsive>
              </ColumnToRowChild>
              <ColumnToRowChild>
                <Image
                  source={require('./public/img/schedule_hero-image.jpg')}
                  resizeMode="cover"
                  style={{ flex: 1, width: '100%', paddingTop: '56.25%' }}
                />
              </ColumnToRowChild>
            </ColumnToRow>
          </Container>
        </NoFlexToFlex>
      </View>

      <View
        style={{
          marginVertical: 80,
        }}
      >
        <Container style={{
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          paddingBottom: 100
        }}>
          <Heading style={{ marginVertical: 80, textAlign: 'center'}}>Today’s Schedule</Heading>
          <View>
            <ColumnToRow>
              <ColumnToRowChild>
                <Responsive
                  style={{
                    marginLeft: [0, 120],
                  }}
                >
                  <Schedule />
                </Responsive>
              </ColumnToRowChild>
              <ColumnToRowChild>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'red',
                  }}
                >
                  {/* MAP HERE */}
                  <View
                    style={{
                      width: '100%',
                      maxWidth: 532,
                      overflow: 'hidden',
                      height: 371,
                      backgroundColor: 'blue',
                      borderRadius: theme.radii[2],
                    ...theme.shadows.large
                    }}
                  />
                </View>
              </ColumnToRowChild>
            </ColumnToRow>
          </View>
        </Container>
      </View>

      <PageFooter />
    </GenericPage>
  );
}

SchedulePage.navigationOptions = {
  title: 'Schedule',
};

export default SchedulePage;
