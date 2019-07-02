import React from 'react';
import View from '../views/View';
import Container from './Container';
import Title from './Title';
import BodyText from './BodyText';
import ButtonLink from './ButtonLink';
import { ColumnToRow, ColumnToRowChild, Responsive } from './Responsive';
import Schedule from './Schedule';

function HomeSchedule() {
  return (
    <Responsive style={{ marginBottom: [60, 100] }}>
      <View>
        <Container>
          <ColumnToRow>
            <ColumnToRowChild>
              <Responsive
                style={{
                  alignItems: ['center !important', 'flex-start !important'],
                  // paddingRight: [0, 40],
                  marginBottom: [80, 0],
                  maxWidth: ['100%', 412],
                }}
              >
                <View
                  style={{
                    flexDirection: 'column',
                  }}
                >
                  <Responsive
                    style={{
                      marginBottom: [12, 16],
                    }}
                  >
                    <Title>Where are we today?</Title>
                  </Responsive>
                  <Responsive
                    style={{
                      textAlign: ['center', 'left'],
                      marginBottom: [48, 40],
                    }}
                  >
                    <BodyText>
                      Ono Blends is based in LA, but we’re always on the move.
                      Check out our schedule to find us today!
                    </BodyText>
                  </Responsive>
                  <ButtonLink
                    type="solid"
                    title="Find us"
                    routeName="Schedule"
                    buttonStyle={{ width: 220 }}
                  />
                </View>
              </Responsive>
            </ColumnToRowChild>
            <ColumnToRowChild
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              <Title style={{ marginBottom: 28 }}>Today's Schedule</Title>
              <View
                style={{
                  // backgroundColor: theme.colors.lightGrey,
                  width: '100%',
                  flex: 1,
                }}
              >
                <Schedule />
              </View>
            </ColumnToRowChild>
          </ColumnToRow>
        </Container>
      </View>
    </Responsive>
  );
}

export default HomeSchedule;
