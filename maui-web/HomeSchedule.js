import React from 'react';
import View from '../views/View';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import BaseText from '../dashboard/BaseText';
import ButtonLink from '../dashboard/ButtonLink';
import { ColumnToRow, ColumnToRowChild } from '../dashboard/Responsive';
import { Responsive } from '../dashboard/Responsive';
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
                  maxWidth: ['100%', 416],
                  paddingRight: [0, 40]
                }}
              >
                <View
                  style={{
                    flexDirection: 'column',
                  }}
                >
                  <Heading size="small" responsiveStyle={{ marginBottom: [12, 16] }}>
                    Where are we today?
                  </Heading>
                  <BaseText
                    responsiveStyle={{
                      textAlign: ['center', 'left'],
                      marginBottom: [48, 40],
                    }}
                  >
                    Ono Blends is based in LA, but we’re always on the move.
                    Check out our schedule to find us today!
                  </BaseText>

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
              <Heading size="small" style={{ marginBottom: 28 }}>Today's Schedule</Heading>
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
