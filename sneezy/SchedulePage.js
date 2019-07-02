import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import { useTheme } from '../dashboard/Theme';
import { aspectRatio43 } from '../components/Styles';
import {
  NoFlexToFlex,
  ColumnToRow,
  ColumnToRowChild,
} from './Responsive';
import { Responsive } from '../dashboard/Responsive';
import Container from './Container';
import Title from './Title';
import Heading from './Heading';
import BodyText from './BodyText';
import Schedule from './Schedule';
import RequestCityForm from './RequestCityForm';
import WeekSchedule from './WeekSchedule';

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
                    <Title
                      responsiveStyle={{
                        textAlign: ['center', 'left'],
                      }}
                    >
                      Where are we today?
                    </Title>
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
          <Heading style={{ marginBottom: 80, textAlign: 'center' }}>
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
          <ColumnToRow>
            <ColumnToRowChild className="hide-mobile" style={{ flex: 2 }}>
              <Image
                style={{
                  marginHorizontal: 40,
                  maxWidth: 333,
                  ...aspectRatio43,
                }}
                source={require('./public/img/map.jpg')}
              />
            </ColumnToRowChild>
            <ColumnToRowChild style={{ flex: 3, justifyContent: 'center' }}>
              <Heading
                responsiveStyle={{
                  textAlign: ['center', 'left'],
                  alignSelf: ['center', 'flex-start'],
                }}
              >
                Don’t see us in your city?
              </Heading>
              <BodyText
                style={{ marginBottom: 20, maxWidth: 412 }}
                responsiveStyle={{
                  textAlign: ['center', 'left'],
                  alignSelf: ['center', 'flex-start'],
                }}
              >
                Ono Blends is always looking to grow. Request your city and
                we’ll try to make it happen.
              </BodyText>
              <RequestCityForm />
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
