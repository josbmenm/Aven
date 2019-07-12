import React from 'react';
import { Image, StyleSheet } from 'react-native';
import View from '../views/View';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import { useTheme } from '../dashboard/Theme';
import { aspectRatio43 } from '../components/Styles';
import { NoFlexToFlex, ColumnToRow, ColumnToRowChild } from './Responsive';
import { Responsive } from '../dashboard/Responsive';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import BodyText from '../dashboard/BodyText';
import Schedule from './Schedule';
import RequestCityForm from './RequestCityForm';
import WeekSchedule from './WeekSchedule';

const breakpoints = [1024, 1400];

function SchedulePage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <View
        style={{
          marginTop: 40,
          marginBottom: 80,
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
                    <Heading variant="small"
                      responsiveStyle={{
                        textAlign: ['center', 'left'],
                      }}
                    >
                      Where are we today?
                    </Heading>
                    <BodyText
                      responsiveStyle={{
                        textAlign: ['center', 'left'],
                      }}
                    >
                      Ono Blends is based in LA, but we’re always on the move.
                      If you’d like to see us in your city, please{' '}
                      <BodyText bold>request a new city</BodyText> and we’ll try
                      to make it happen!
                    </BodyText>
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
        <Container
          style={{
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.border,
            paddingBottom: 100,
          }}
        >
          <Heading variant="large" style={{ marginBottom: 80, textAlign: 'center' }}>
            Today’s Schedule
          </Heading>
          <View>
            <ColumnToRow>
              <ColumnToRowChild>
                <Responsive
                  style={{
                    marginLeft: [0, 120],
                    marginRight: [0, 40],
                  }}
                >
                  <Schedule withFloatingLabel={true} />
                </Responsive>
              </ColumnToRowChild>
              <ColumnToRowChild>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* MAP HERE */}
                  <View
                    style={{
                      width: '100%',
                      maxWidth: 532,
                      overflow: 'hidden',
                      height: 371,
                      backgroundColor: theme.colors.lightGrey,
                      borderRadius: theme.radii[2],
                      ...theme.shadows.large,
                    }}
                  />
                </View>
              </ColumnToRowChild>
            </ColumnToRow>
          </View>
        </Container>
      </View>
      <WeekSchedule />
      <View style={{ paddingVertical: 80 }}>
        <Container>
          <ColumnToRow breakpoints={breakpoints}>
            <Responsive
              breakpoints={breakpoints}
              style={{ display: ['none', 'flex'] }}
            >
              <ColumnToRowChild style={{ flex: 2, paddingRight: 60 }}>
                <Image
                  style={{
                    ...aspectRatio43,
                  }}
                  source={require('./public/img/map.jpg')}
                />
              </ColumnToRowChild>
            </Responsive>
            <ColumnToRowChild style={{ flex: 3, justifyContent: 'center' }}>
              <Heading
                variant="small"
                breakpoints={breakpoints}
                responsiveStyle={{
                  textAlign: ['center', 'left'],
                  alignSelf: ['center', 'flex-start'],
                }}
              >
                Don’t see us in your city?
              </Heading>
              <BodyText
                style={{ maxWidth: 412 }}
                breakpoints={breakpoints}
                responsiveStyle={{
                  textAlign: ['center', 'left'],
                  alignSelf: ['center', 'flex-start'],
                  marginBottom: [60, 40],
                }}
              >
                Ono Blends is always looking to grow. Request your city and
                we’ll try to make it happen.
              </BodyText>
              <RequestCityForm breakpoints={breakpoints} />
            </ColumnToRowChild>
          </ColumnToRow>
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
