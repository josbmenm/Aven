import React from 'react';
import { Image, StyleSheet } from 'react-native';
import View from '../views/View';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import { useTheme } from '../dashboard-ui-deprecated/Theme';
import {
  NoFlexToFlex,
  ColumnToRow,
  ColumnToRowChild,
} from '../dashboard-ui-deprecated/Responsive';
import { Responsive } from '../dashboard-ui-deprecated/Responsive';
import Container from '../dashboard-ui-deprecated/Container';
import Heading from '../dashboard-ui-deprecated/Heading';
import BodyText from '../dashboard-ui-deprecated/BodyText';
import Schedule from './Schedule';
import RequestCity from './RequestCity';
import WeekSchedule from './WeekSchedule';
import Link from '../navigation-web/Link';

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
                    <Heading
                      size="small"
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
                      <BodyText bold>
                        <Link routeName="RequestLocation">
                          and we’ll try to make it happen!
                        </Link>
                      </BodyText>
                    </BodyText>
                  </View>
                </Responsive>
              </ColumnToRowChild>
              <ColumnToRowChild>
                <Image
                  source={require('./public/img/Schedule_Hero.png')}
                  style={{
                    flex: 1,
                    width: '100%',
                    paddingTop: '70%',
                    resizeMode: 'cover',
                  }}
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
          <Heading
            size="large"
            style={{ marginBottom: 80, textAlign: 'center' }}
          >
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
        <RequestCity />
      </View>
      <PageFooter />
    </GenericPage>
  );
}

SchedulePage.navigationOptions = {
  title: 'Schedule',
};

export default SchedulePage;
